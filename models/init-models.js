var DataTypes = require("sequelize").DataTypes;
var _Chats = require("./Chats");
var _Memories = require("./Memories");
var _Users = require("./Users");
var __ACADEMIC_TITLE = require("./_ACADEMIC_TITLE");
var __AR_DETAILS = require("./_AR_DETAILS");
var __BR = require("./_BR");
var __BR_RECORD = require("./_BR_RECORD");
var __COPY = require("./_COPY");
var __UDC = require("./_UDC");
var __UDC_RELATION = require("./_UDC_RELATION");
var _chats = require("./chats");

function initModels(sequelize) {
  var Chats = _Chats(sequelize, DataTypes);
  var Memories = _Memories(sequelize, DataTypes);
  var Users = _Users(sequelize, DataTypes);
  var _ACADEMIC_TITLE = __ACADEMIC_TITLE(sequelize, DataTypes);
  var _AR_DETAILS = __AR_DETAILS(sequelize, DataTypes);
  var _BR = __BR(sequelize, DataTypes);
  var _BR_RECORD = __BR_RECORD(sequelize, DataTypes);
  var _COPY = __COPY(sequelize, DataTypes);
  var _UDC = __UDC(sequelize, DataTypes);
  var _UDC_RELATION = __UDC_RELATION(sequelize, DataTypes);
  var chats = _chats(sequelize, DataTypes);


  return {
    Chats,
    Memories,
    Users,
    _ACADEMIC_TITLE,
    _AR_DETAILS,
    _BR,
    _BR_RECORD,
    _COPY,
    _UDC,
    _UDC_RELATION,
    chats,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
