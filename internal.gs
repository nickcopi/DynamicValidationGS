function isValid(){
  return true;

}
function onEdit(e){
  try{
  const CAMPUS = 2;
  const BUILDING = 3;
  var x = e.range.getColumn();
  var y = e.range.getRow();
  var value = e.value;
  var sheet = e.source;
  Logger.log(x + ',' + y);
  if(x === CAMPUS){
    if(value === 'MCV' || value === 'MPC'){
      var range = columnFromNumber(x+1) + y;
      var validationList = getCampusData(value,sheet);
      var rule = SpreadsheetApp.newDataValidation().requireValueInList(validationList).build();
      sheet.getRange(range).setDataValidation(rule);
    }
  } else if (x === BUILDING){
    if(!e.range.getDataValidation()) return;
    var pos = e.range.getDataValidation().getCriteriaValues()[0].indexOf(value);
    if(pos === -1) return;
    var range = columnFromNumber(x-1) + y;
    var campus = sheet.getRange(range).getValue();
    if(campus !== 'MCV' && campus !== 'MPC') return;
    var validationList = getRoomValids(value,campus,pos,sheet);
    var range = columnFromNumber(x+1) + y;
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(validationList).build();
    sheet.getRange(range).setDataValidation(rule);
  }
  } catch(e){
    Logger.log(e);
  }
}


//converted from ?php? maybe
function columnFromNumber($n)
{
    $n--;
    for($r = ""; $n >= 0; $n = Math.floor($n / 26) - 1)
        $r = String.fromCharCode($n%26 + 0x41) + $r;
    return $r;
}


//get sheet from wheter mpc or mcv
function getNamedSheet(name,sheet){
  var validationMCV;
  var validationMPC;
   sheet.getSheets().forEach(function(s){
    if(s.getName() === 'Validation-MCV') validationMCV = s;
    if(s.getName() === 'Validation-MPC') validationMPC = s;
  });
  return name === 'MCV'?validationMCV:validationMPC;
}


//return a list of valid room names based on campus
function getCampusData(name,sheet){
  var subSheet = getNamedSheet(name,sheet);
  var buildings = subSheet.getRange('B2').getValue();
  var validationList = [];
  for(i = 3;i < 3+buildings;i++){
    validationList.push(subSheet.getRange('B' + i).getValue());
  }
  return validationList;
}


function getRoomValids(name,campus,pos,sheet){
  var subSheet = getNamedSheet(campus,sheet);
  var x = columnFromNumber(pos+3);
  var rooms = subSheet.getRange(x + '2').getValue();
  var validationList = [];
  for(var i = 3; i <3+rooms;i++){
    validationList.push(subSheet.getRange(x+i).getValue());
  }
  return validationList;
  
}