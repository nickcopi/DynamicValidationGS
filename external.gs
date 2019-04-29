function ImportJSON(id){
  var data = getFileContent(id);
  if(!data) throw new Error("No data!");
  data = data.Universities[0];
  fillValidation(data);
}

function fillValidation(data){
  var sheet = SpreadsheetApp.openById(config.targetSheetId);
  var sheets = sheet.getSheets();
  var validationMCV;
  var validationMPC;
  //find specific mcv/mpc sheet to clean up
  sheets.forEach(function(s){
    if(s.getName() === config.mcvSheet) validationMCV = s;
    if(s.getName() === config.mpcSheet) validationMPC = s;
  });
  //delete and make new sheets
  if(validationMCV) sheet.deleteSheet(validationMCV);
  validationMCV = sheet.insertSheet();
  validationMCV.setName(config.mcvSheet);
  Logger.log("Making sheet: " + config.mcvSheet);
  if(validationMPC) sheet.deleteSheet(validationMPC);
  validationMPC = sheet.insertSheet();
  validationMPC.setName(config.mpcSheet);
  Logger.log("Making sheet: " + config.mpcSheet);
  //fill validaiton sheets with data
  fillValid(validationMPC,data,0);
  fillValid(validationMCV,data,1);
}


function fillValid(sheet,data,num){
    sheet.getRange('A1').setValue("Buildings");
    sheet.getRange('A2').setValue(data.Campuses[num].Buildings.length);
    sheet.getRange('B2').setValue(data.Campuses[num].Buildings.length);
    var buildings = makeBuildingsLessSad(data.Campuses[num].Buildings);
    buildings.forEach(function(building,i){  
    //list out acronyms
    var range = 'A' + (i + 3);
    sheet.getRange(range).setValue(building.Acronym);
    // list out names
    var range = 'B' + (i + 3);
    sheet.getRange(range).setValue(building.Name);
    var letter = columnFromNumber(i+2);
    range = letter + '1';
    sheet.getRange(range).setValue(building.Acronym);
    var j = 0;
    //fill number of rooms in list above the list
    range = letter + 2;
    sheet.getRange(range).setValue(getActualLength(building.Rooms));
    building.Rooms.forEach(function(room){
      range = letter + (j+3);
      if(!room.RoomNumber)
        return;
      sheet.getRange(range).setValue(room.RoomNumber)
      j++;
    });
  });
  
}

//merge duplicate buildings
function makeBuildingsLessSad(buildings){
  var newBuildings = [];
  buildings.forEach(function(b){
    var merged = false;
    newBuildings.forEach(function(n){
      if(b.Acronym === n.Acronym){
        n.Rooms = n.Rooms.concat(b.Rooms);
        merged = true;
      }
    });
    if(!merged) newBuildings.push(b);
  });
  return newBuildings;
}


function getActualLength(arr){
  var count = 0;
  arr.forEach(function(i){
    if(i.RoomNumber !== ''){
      count++;
    }
  });
  return count;
}

var config = {
  mcvSheet: 'Validation-MCV',
  mpcSheet: 'Validation-MPC',
  targetSheetId: '1LTzAEKaul_LSpuV4xj9FMFJ0mMnjTPXgOnBiqofHBoM',
  emsDataJsonName: 'vcuaaaa.json'
}


//converted from ?php? maybe
function columnFromNumber($n)
{
    for($r = ""; $n >= 0; $n = Math.floor($n / 26) - 1)
        $r = String.fromCharCode($n%26 + 0x41) + $r;
    return $r;
}

function getFileContent(id) {
  var fileName = config.emsDataJsonName;
  var files = DriveApp.getFilesByName(fileName);
  if (files.hasNext()) {
    var file = files.next();
    var content = file.getBlob().getDataAsString();
    var json = JSON.parse(content);
    return json;
  }
}