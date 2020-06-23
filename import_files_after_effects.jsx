// Creating a project
var currentProject  = (app.project) ? app.project: app.newProject();

// get the folder
var fldr = Folder.selectDialog("Choose a folder of files to import");

// Creating a composition
var cs = [readData().compWidth, readData().compHeight, 1, 300, 24];
var defaultCompName = readData().compName;
var currentComp     = (currentProject.activeItem) ? currentProject.activeItem: currentProject.items.addComp(defaultCompName, cs[0], cs[1], cs[2], cs[3], cs[4]);
currentComp.openInViewer();


function readData() {
  var txtArray = [];
  var currentLine;

  var textFile = fldr.getFiles("*.txt");
  var file = new File(textFile);

  file.open("r");
  
  while(!file.eof) {
    currentLine = file.readln();
    txtArray.push(currentLine);
  }
  
  file.close();
  
  var txtObj = {
    compName: txtArray[0],
    compWidth: parseInt(txtArray[1].split(",")[0]),
    compHeight: parseInt(txtArray[1].split(",")[1]),
    layerCoords: txtArray.slice(2, txtArray.length + 1)
  };

  return txtObj;
}

function importFiles(){
  app.beginUndoGroup("Import files from folder");

  if(fldr == null) return;

  var files = fldr.getFiles("*.png");
  if (files.length == 0) return;

  for (var i = files.length - 1; i >= 0; i--) {
    var io = new ImportOptions();
    io.file = File(files[i]);
    var newImage = app.project.importFile(io);
    currentComp.layers.add(newImage);
  }

  app.endUndoGroup();
}

function shiftLayers(){
  app.beginUndoGroup("Shift layers to their correct positions");

  layerCoords = readData().layerCoords;

  for (var i = 1; i < currentComp.layers.length + 1; i++) {
    var tempNameArr = currentComp.layer(i).name.split("_");

    if (tempNameArr[1].length === 5 && tempNameArr[1].charAt(4) === "s") {
      tempNameArr = tempNameArr.slice(3, tempNameArr.length + 1).join("_").split(".png");
      currentComp.layer(i).name = tempNameArr[0];
      // alert(currentComp.layer(i).name);
    } else {
      tempNameArr = tempNameArr.slice(3, tempNameArr.length + 1).join("_").split(".png");
      currentComp.layer(i).name = tempNameArr[0];
      // alert(currentComp.layer(i).name);

    }
  }

  for (var i = 1; i <= currentComp.layers.length; i++) {
    for (var j = 0; j < layerCoords.length; j++) {

      if (currentComp.layer(i).name === layerCoords[j].split(",")[0]) {
        var newPosition = layerCoords[j].split(",").slice(1, 3);
        currentComp.layer(i).property("Position").setValue(newPosition);
        // alert(layerCoords[j].split(",")[0] + ' vs ' + currentComp.layer(i).name);

      }
    }
  }

  // alert(currentComp.layer(3).name === layerCoords[0].split(",")[0]);

  app.endUndoGroup();
}

importFiles();
shiftLayers();