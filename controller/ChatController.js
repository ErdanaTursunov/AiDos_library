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
            content: `Вы - умный библиотекарь-ассистент. Ваша главная задача - помогать пользователям находить нужные книги через диалог.

ПРАВИЛА АНАЛИЗА ЗАПРОСОВ:

1. Общие вопросы (например: "Какие книги есть?", "Что почитать?"):
   - НЕ делать поиск сразу
   - Спросить об интересующей теме/области
   - Помочь конкретизировать запрос
   Пример:
   Пользователь: "Какие книги у вас есть?"
   Ответ: "Я помогу вам найти интересные книги. Скажите, какая тема вас интересует: художественная литература, научные работы, учебные материалы?"

2. Неопределенные запросы (например: "Нужно для диссертации", "Ищу материалы"):
   - Задать уточняющие вопросы о теме/направлении
   - Помочь сузить область поиска
   Пример:
   Пользователь: "Ищу материалы для работы"
   Ответ: "По какой теме вы работаете? Это научное исследование, учебный материал или что-то другое?"

3. Неоднозначные запросы (например: "STEM", "Python"):
   - Уточнить, что именно ищет пользователь
   - Предложить варианты интерпретации
   Пример:
   Пользователь: "Python"
   Ответ: "Уточните, пожалуйста: вы ищете книги по программированию на Python или конкретную книгу с этим словом в названии?"

4. Конкретные запросы (например: "Книги Абая", "Учебник по физике"):
   - Если запрос четкий - выполнить поиск
   - Если есть неоднозначность - уточнить детали
   Пример:
   Пользователь: "Найти книги Абая"
   [выполнить поиск]

ПРАВИЛА ДИАЛОГА:

1. Всегда быть вежливым и готовым помочь
2. Задавать только ОДИН вопрос за раз
3. Предлагать понятные варианты выбора
4. Если пользователь отвечает неопределенно:
   - Задать более конкретный вопрос
   - Предложить варианты на выбор

ПРАВИЛА ПОИСКА:

1. Делать поиск ТОЛЬКО когда есть:
   - Конкретный автор
   - Конкретная тема
   - Конкретное название
   - Четкое уточнение от пользователя

2. При выдаче результатов:
   - Указать количество найденных книг
   - Показать краткий список
   - Предложить уточнить запрос, если результатов много

ЗАПРЕЩЕНО:
1. Делать поиск на общие вопросы без уточнений
2. Предлагать книги, которых нет в результатах поиска
3. Давать более одного уточняющего вопроса за раз
4. Использовать информацию о книгах, которая не получена из текущего поиска

Ваша цель - помочь пользователю найти именно то, что ему нужно, через правильно построенный диалог.`
        };

        // Привязываем методы к контексту
        this.chat = this.chat.bind(this);
        this.clearChat = this.clearChat.bind(this);
        this.extractSearchParams = this.extractSearchParams.bind(this);
        this.analyzeIntent = this.analyzeIntent.bind(this);
    }

    async analyzeIntent(message, previousContext = null) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Вы - анализатор запросов пользователя. Определите тип запроса и необходимые действия.
                        
Верните только JSON объект:
{
    "type": "general" | "undefined" | "ambiguous" | "specific",
    "requiresSearch": boolean,
    "needsClarification": boolean,
    "suggestedQuestion": string,
    "searchParams": {
        "author": string | null,
        "title": string | null,
        "query": string | null
    }
}

Типы запросов:
1. general - общие вопросы ("Какие книги есть?", "Что почитать?")
2. undefined - неопределенные запросы ("Нужно для работы", "Ищу материалы")
3. ambiguous - неоднозначные запросы без конкретной темы ("STEM", "Python")
4. specific - конкретные запросы ("Книги Абая", "Учебник по физике")

ВАЖНО: Если запрос содержит несколько конкретных тем, соединенных словами "и" или "или" 
(например: "математика и физика", "книги по химии или биологии"), 
считать его specific и выполнять поиск без уточняющих вопросов.

Примеры:
- "Математика или физика" -> 
{
    "type": "specific",
    "requiresSearch": true,
    "needsClarification": false,
    "suggestedQuestion": null,
    "searchParams": { "author": null, "title": null, "query": "математика или физика" }
}

- "Книги по химии и биологии" ->
{
    "type": "specific",
    "requiresSearch": true,
    "needsClarification": false,
    "suggestedQuestion": null,
    "searchParams": { "author": null, "title": null, "query": "химии и биологии" }
}

- "Какие книги есть?" -> 
{
    "type": "general",
    "requiresSearch": false,
    "needsClarification": true,
    "suggestedQuestion": "Какая тема вас интересует: художественная литература, научные работы или учебные материалы?",
    "searchParams": { "author": null, "title": null, "query": null }
}

- "Ищу материалы для диссертации" ->
{
    "type": "undefined",
    "requiresSearch": false,
    "needsClarification": true,
    "suggestedQuestion": "По какой теме вы пишете диссертацию?",
    "searchParams": { "author": null, "title": null, "query": null }
}

- "STEM" ->
{
    "type": "ambiguous",
    "requiresSearch": false,
    "needsClarification": true,
    "suggestedQuestion": "Уточните, пожалуйста: вы ищете книгу с названием 'STEM' или книги по STEM-образованию?",
    "searchParams": { "author": null, "title": null, "query": null }
}

- "Найти книги Абая" ->
{
    "type": "specific",
    "requiresSearch": true,
    "needsClarification": false,
    "suggestedQuestion": null,
    "searchParams": { "author": "Абай", "title": null, "query": null }
}`
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.1,
                max_tokens: 500
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.error('Error analyzing intent:', error);
            return {
                type: "undefined",
                requiresSearch: false,
                needsClarification: true,
                suggestedQuestion: "Уточните, пожалуйста, что именно вы хотите найти?",
                searchParams: { author: null, title: null, query: null }
            };
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
4. Если запрос состоит из одно-двух слов без контекста - пометить как needsClarification
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

    async analyzeSearchQuery(query) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Вы - анализатор поисковых запросов. Ваша задача - определить, нужно ли разделять запрос на отдельные темы для поиска.

Верните только JSON объект:
{
    "searchTerms": string[],  // Массив тем для поиска
    "isCompoundQuery": boolean  // Является ли запрос составным
}

ВАЖНЫЕ ПРАВИЛА:
1. Разделять запрос на отдельные темы ТОЛЬКО если:
   - Темы явно разделены союзами "и" или "или"
   - Каждая тема имеет самостоятельный смысл

2. НЕ разделять:
   - Устойчивые словосочетания ("казахский народ", "квантовая физика")
   - Составные термины ("базы данных", "искусственный интеллект")
   - Названия предметов ("высшая математика")

Примеры:
- "математика или физика" -> 
{
    "searchTerms": ["математика", "физика"],
    "isCompoundQuery": true
}

- "казахский народ" ->
{
    "searchTerms": ["казахский народ"],
    "isCompoundQuery": false
}

- "книги по химии и биологии" ->
{
    "searchTerms": ["химия", "биология"],
    "isCompoundQuery": true
}

- "квантовая физика или органическая химия" ->
{
    "searchTerms": ["квантовая физика", "органическая химия"],
    "isCompoundQuery": true
}

- "базы данных" ->
{
    "searchTerms": ["базы данных"],
    "isCompoundQuery": false
}`
                    },
                    {
                        role: "user",
                        content: query
                    }
                ],
                temperature: 0.1,
                max_tokens: 200
            });

            const result = JSON.parse(completion.choices[0].message.content);
            console.log('Search query analysis:', result);
            return result;
        } catch (error) {
            console.error('Error analyzing search query:', error);
            return {
                searchTerms: [query],
                isCompoundQuery: false
            };
        }
    }

    async chat(req, res) {
        try {
            console.log('\n=== New Chat Request ===');
            const { message, token } = req.body;
            console.log('Received message:', message);

            // Получаем последние 5 сообщений из чата для контекста
            const previousMessages = await Chats.findAll({
                where: { token: token || 0 },
                order: [['createdAt', 'DESC']],
                limit: 5
            });

            // Формируем контекст из предыдущих сообщений
            const context = previousMessages.reverse().map(msg => ({
                role: msg.role,
                content: msg.text
            }));

            // Анализируем запрос пользователя с учетом контекста
            const intent = await this.analyzeIntent(message, context);
            console.log('Message intent:', intent);

            // Формируем базовый контекст для ответа
            const messages = [
                this.systemPrompt,
                ...context,
                {
                    role: 'user',
                    content: message
                }
            ];

            let searchResults = null;
            let aiResponse = '';
            
            // Обрабатываем запрос в зависимости от его типа
            switch (intent.type) {
                case 'specific':
                    if (intent.requiresSearch && (intent.searchParams.author || intent.searchParams.title || intent.searchParams.query)) {
                        console.log('\n=== Searching Books ===');
                        console.log('Search parameters:', intent.searchParams);
                        
                        // Анализируем поисковый запрос через AI
                        const queryAnalysis = await this.analyzeSearchQuery(intent.searchParams.query);
                        console.log('Query analysis:', queryAnalysis);

                        let allResults = { books: [] };
                        
                        // Выполняем поиск для каждой темы
                        for (const term of queryAnalysis.searchTerms) {
                            console.log('Searching for:', term);
                            
                            const searchReq = { 
                                body: { 
                                    author: intent.searchParams.author, 
                                    title: intent.searchParams.title, 
                                    query: term
                                } 
                            };
                            const searchRes = {
                                json: (data) => {
                                    console.log(`Results for "${term}":`, data.books ? data.books.length : 0, 'books found');
                                    if (data.books && data.books.length > 0) {
                                        data.books.forEach(book => {
                                            if (!allResults.books.some(b => b.BR_ID === book.BR_ID)) {
                                                allResults.books.push(book);
                                            }
                                        });
                                    }
                                }
                            };
                            await BookController.searchBooks(searchReq, searchRes);
                        }
                        
                        console.log('Total unique books found:', allResults.books.length);
                        searchResults = allResults;

                        // Если книги не найдены, добавляем информацию об этом в контекст
                        if (!searchResults.books || searchResults.books.length === 0) {
                            messages.push({
                                role: 'system',
                                content: `По запросу "${intent.searchParams.query}" книги не найдены. Предложите пользователю:
1. Проверить правильность написания
2. Использовать более общие термины
3. Уточнить конкретные аспекты темы, которые их интересуют`
                            });
                        } else {
                            // Добавляем результаты поиска в контекст
                            messages.push({
                                role: 'system',
                                content: `Найденные книги:\n${JSON.stringify(searchResults.books, null, 2)}\n\nОтветьте на основе этих результатов.${
                                    queryAnalysis.isCompoundQuery ? 
                                    '\nЭто был составной запрос по темам: ' + queryAnalysis.searchTerms.join(', ') :
                                    ''
                                }`
                            });
                        }
                    }
                    break;

                case 'ambiguous':
                    aiResponse = intent.suggestedQuestion;
                    break;

                case 'general':
                case 'undefined':
                    aiResponse = intent.suggestedQuestion;
                    break;
            }

            // Если ответ еще не сформирован (для случаев с поиском), получаем его от AI
            if (!aiResponse) {
                console.log('\n=== Getting AI Response ===');
                const completion = await this.openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 500
                });

                aiResponse = completion.choices[0].message.content;
            }

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
                searchResults: searchResults,
                needsClarification: intent.needsClarification
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