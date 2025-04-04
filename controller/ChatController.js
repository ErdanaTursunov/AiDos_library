const OpenAI = require('openai');
const sequelize = require('../db');
const { chats: Chats } = require('../models/init-models')(sequelize);
const BookController = require('./BookController');

class ChatController {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        this.systemPrompt = {
            role: "system",
            content: `Вы - умный библиотекарь-ассистент нашей библиотеки. Ваша задача - помогать пользователям находить книги в нашей базе данных.

ПРАВИЛА ПОИСКА:
1. Если пользователь ищет конкретного автора или название:
   - Используйте точные значения для поиска
   - Не разбивайте имя автора на части
   
2. Если пользователь ищет по теме или описанию:
   - Используйте поле query для поиска по ключевым словам
   - Система автоматически найдет книги по описанию и UDC

3. Если запрос неоднозначный:
   - Спросите пользователя, что именно он ищет
   - Например: "STEM" может быть названием книги или темой поиска
   - Уточните намерение пользователя перед поиском

ПРАВИЛА ОТВЕТА:
1. Отвечайте ТОЛЬКО на основе полученных результатов поиска
2. Если книги найдены:
   - Укажите количество найденных книг
   - Перечислите их названия и авторов
   
3. Если книги НЕ найдены:
   - Сообщите об этом пользователю
   - Предложите:
     * Проверить правильность написания
     * Использовать другие ключевые слова
     * Попробовать поиск по теме вместо автора или наоборот

4. НЕ ПРЕДЛАГАЙТЕ книги, которых нет в результатах поиска
5. НЕ ИСПОЛЬЗУЙТЕ свои знания о книгах - только данные из поиска

Будьте вежливы и профессиональны, но строго придерживайтесь результатов поиска в нашей базе данных.`
        };

        // Привязываем методы к контексту
        this.chat = this.chat.bind(this);
        this.clearChat = this.clearChat.bind(this);
        this.extractSearchParams = this.extractSearchParams.bind(this);
        this.analyzeIntent = this.analyzeIntent.bind(this);
    }

    async analyzeIntent(message) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Вы - анализатор намерений пользователя. Определите, требует ли сообщение поиска книг.
                        
Верните только JSON объект:
{
    "requiresSearch": boolean,
    "isGreeting": boolean,
    "isFarewell": boolean,
    "isGratitude": boolean,
    "isGeneralQuestion": boolean
}

Примеры:
- "Привет" -> {"requiresSearch": false, "isGreeting": true, ...}
- "Спасибо" -> {"requiresSearch": false, "isGreeting": false, "isGratitude": true, ...}
- "Пока" -> {"requiresSearch": false, "isGreeting": false, "isFarewell": true, ...}
- "Найти книги про STEM" -> {"requiresSearch": true, ...}
- "Есть книги Абая?" -> {"requiresSearch": true, ...}
- "Как вы работаете?" -> {"requiresSearch": false, "isGeneralQuestion": true, ...}`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.1,
                max_tokens: 100
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error analyzing intent:', error);
            return { requiresSearch: true }; // По умолчанию пытаемся искать
        }
    }

    async extractSearchParams(message) {
        try {
            console.log('\n=== Extracting Search Parameters ===');
            console.log('Input message:', message);
            
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Вы - анализатор текста. Ваша задача - извлечь параметры поиска книг из сообщения пользователя или определить, что запрос требует уточнения.

Если запрос однозначный, верните JSON объект:
{
    "author": "имя автора или null",
    "title": "название книги или null",
    "query": "общий поисковый запрос или null",
    "needsClarification": false
}

Если запрос неоднозначный (например, одно слово может быть как названием книги, так и темой поиска),
верните JSON объект:
{
    "author": null,
    "title": null,
    "query": null,
    "needsClarification": true,
    "clarificationQuestion": "вопрос для уточнения"
}

Правила определения параметров:
1. Если явно упоминается конкретный автор - записать в author
2. Если явно упоминается конкретное название - записать в title
3. Если это явно общий запрос по теме - записать в query
4. Если запрос состоит из одного-двух слов без контекста - пометить как needsClarification
5. Не добавляйте никакого дополнительного текста к JSON

Примеры:
- "Найти книги про STEM" -> query: "STEM"
- "STEM" -> needsClarification: true с уточняющим вопросом
- "Книга называется STEM" -> title: "STEM"`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.1,
                max_tokens: 200
            });

            const extractedParams = JSON.parse(completion.choices[0].message.content);
            console.log('Extracted parameters:', extractedParams);

            // Если нужно уточнение, возвращаем специальный ответ
            if (extractedParams.needsClarification) {
                return {
                    needsClarification: true,
                    clarificationQuestion: extractedParams.clarificationQuestion
                };
            }

            // Иначе возвращаем параметры поиска
            return {
                author: extractedParams.author,
                title: extractedParams.title,
                query: extractedParams.query
            };

        } catch (error) {
            console.error('Error extracting search params:', error);
            console.log('Falling back to default parameters');
            return { author: null, title: null, query: message };
        }
    }

    async chat(req, res) {
        try {
            console.log('\n=== New Chat Request ===');
            const { message, token } = req.body;
            console.log('Received message:', message);

            // Сначала анализируем намерение пользователя
            const intent = await this.analyzeIntent(message);
            console.log('Message intent:', intent);

            // Получаем последние 5 сообщений из чата для контекста
            const previousMessages = await Chats.findAll({
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            // Формируем контекст из предыдущих сообщений
            const context = previousMessages.reverse().map(msg => ({
                role: msg.role,
                content: msg.text
            }));

            // Добавляем системный промпт и текущее сообщение
            const messages = [
                this.systemPrompt,
                ...context,
                {
                    role: 'user',
                    content: message
                }
            ];

            let searchResults = null;
            
            // Выполняем поиск только если сообщение требует этого
            if (intent.requiresSearch) {
                // Извлекаем параметры поиска из сообщения
                const searchParams = await this.extractSearchParams(message);

                // Если нужно уточнение, отправляем уточняющий вопрос
                if (searchParams.needsClarification) {
                    const aiResponse = `Уточните, пожалуйста: ${searchParams.clarificationQuestion}`;
                    
                    // Сохраняем сообщение пользователя в чат
                    await Chats.create({
                        role: 'user',
                        text: message,
                        token: token || 0
                    });

                    // Сохраняем уточняющий вопрос в чат
                    await Chats.create({
                        role: 'assistant',
                        text: aiResponse,
                        token: token || 0
                    });

                    return res.json({
                        message: aiResponse,
                        needsClarification: true
                    });
                }

                // Выполняем поиск книг, если есть параметры
                if (searchParams.author || searchParams.title || searchParams.query) {
                    console.log('\n=== Searching Books ===');
                    console.log('Search parameters:', searchParams);
                    
                    const searchReq = { body: searchParams };
                    const searchRes = {
                        json: (data) => {
                            searchResults = data;
                            console.log('Search results:', JSON.stringify(data, null, 2));
                        }
                    };
                    await BookController.searchBooks(searchReq, searchRes);

                    // Добавляем результаты поиска в контекст
                    if (searchResults && searchResults.books) {
                        console.log('Adding search results to context');
                        messages.push({
                            role: 'system',
                            content: `Найденные книги:\n${JSON.stringify(searchResults.books, null, 2)}\n\nИспользуйте эту информацию в вашем ответе.`
                        });
                    }
                }
            } else {
                // Добавляем информацию о типе сообщения в контекст
                messages.push({
                    role: 'system',
                    content: `Это ${
                        intent.isGreeting ? 'приветствие' :
                        intent.isFarewell ? 'прощание' :
                        intent.isGratitude ? 'благодарность' :
                        intent.isGeneralQuestion ? 'общий вопрос' :
                        'обычное сообщение'
                    }. Ответьте соответственно, не выполняя поиск книг.`
                });
            }

            // Получаем ответ от OpenAI
            console.log('\n=== Getting AI Response ===');
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            });

            const aiResponse = completion.choices[0].message.content;
            console.log('AI Response:', aiResponse);

            // Сохраняем сообщение пользователя в чат
            await Chats.create({
                role: 'user',
                text: message,
                token: token || 0
            });

            // Сохраняем ответ AI в чат
            await Chats.create({
                role: 'assistant',
                text: aiResponse,
                token: token || 0
            });

            return res.json({
                message: aiResponse,
                searchResults: searchResults
            });

        } catch (error) {
            console.error('Error in chat:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                details: error.message
            });
        }
    }

    async clearChat(req, res) {
        try {
            await Chats.destroy({
                where: {}
            });
            return res.json({ message: 'Chat history cleared successfully' });
        } catch (error) {
            console.error('Error clearing chat:', error);
            return res.status(500).json({
                error: 'Internal Server Error',
                details: error.message
            });
        }
    }
}

module.exports = new ChatController(); 