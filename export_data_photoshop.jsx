// Bring application forward
app.bringToFront();

// Set active Document variable and decode name for output
var docRef = app.activeDocument;
var docName = decodeURI(activeDocument.name);
docName = docName.replace(".psd", "");

// Define pixels as unit of measurement
var defaultRulerUnits = preferences.rulerUnits;
preferences.rulerUnits = Units.PIXELS;

// Define variable for the number of layers in the active document
var layerNum = app.activeDocument.artLayers.length;

// Define variable for the active layer in the active document
var layerRef = app.activeDocument.activeLayer;

// Define varibles for x and y of layers
var x = layerRef.bounds[0].value;
var y = layerRef.bounds[1].value;
var coords = "";

function getSize(){
  var w = app.activeDocument.width.toString().replace(' px', '');
  var h = app.activeDocument.height.toString().replace(' px', '');
  return [w, h];
}

// Loop to iterate through all layers
function recurseLayers(currLayers) {
  for ( var i = currLayers.layers.length - 1; i >= 0; i-- ) {
    layerRef = currLayers.layers[i];
    width = layerRef.bounds[2].value - layerRef.bounds[0].value;
    height = layerRef.bounds[3].value - layerRef.bounds[1].value;
    x = layerRef.bounds[2].value - (width / 2);
    y = layerRef.bounds[3].value - (height / 2);
    coords += layerRef.name.split(" ").join("-") + "," + x + "," + y + "\n";

    //test if it's a layer set
    if ( isLayerSet(currLayers.layers[i]) ) {
      recurseLayers(currLayers.layers[i]);
    }
  }
}

//a test for a layer set
function isLayerSet(layer) {
  try {
    if ( layer.layers.length > 0 ) {
      return true;
    }
  }

  catch(err) {
    return false;
  }
}

// Ask the user for the folder to export to
var FPath = Folder.selectDialog("Save exported coordinates to");

// Detect line feed type
if ( $.os.search(/windows/i) !== -1 ) {
  fileLineFeed = "Windows";
}
else {
  fileLineFeed = "Macintosh";
}

// Export to txt file
function writeFile(info) {
  try {
    var f = new File(FPath + "/" + docName + ".txt");
    f.remove();
    f.open('a');
    f.lineFeed = fileLineFeed;
    f.write(info);
    f.close();
  }
  catch(e){}
}

// Run the functions
recurseLayers(docRef);
var conclusive = docName + "\n" + getSize()[0] + "," + getSize()[1] + "\n" + coords;
writeFile(conclusive);

// Set preferences back to user's defaults
preferences.rulerUnits = defaultRulerUnits;

// Show results
if ( FPath == null ) {
  alert("Export aborted", "Canceled");
}
else {
  alert("Exported data for " + layerNum + " layers to" + FPath + "/" + docName + ".txt " + "using " + fileLineFeed + " line feeds.", "Success!");
}

