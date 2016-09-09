var fs = require('fs');
var marked = require('marked');
var async = require('async');

var renderer = new marked.Renderer();

// Helper renderers
marked.options({
  renderer: renderer
})
renderer.heading = function (text, level) {
  var escapedText = text.toLowerCase().replace(/[^a-zA-Z]+/g, '');
  if(level <= 2){
      return '<h' + level + '><a name="' +
                  escapedText +
                  '" href="#' +
                  escapedText +
                  '">' + text + '</a></h' + level + '>' + '\r\n\r\n';
  } 
  else {
    return '<h' + level + '>' + text + '</h' + level + '>' + '\r\n\r\n';
  } 
  
}

function renderMainPage(callback){
  //Header
  var mdsToRender = ['renderthis/a1-mainscreen.md', 'renderthis/b1-features.md',  'renderthis/ss02-logging-details.md', 'renderthis/faq07-settings-changed.md', 'renderthis/faq11-remove-notification.md']
  var outFile = fs.createWriteStream('out/index.html')
  outFile.on('error', function(err){console.log(err)});
  outFile.write(fs.readFileSync('scaffolding/top.html', 'utf8'));

  async.eachSeries(mdsToRender,
    function(filename, cb) {
        fs.readFile(filename, 'utf8', function(err, content) {
          console.log('--------------------------------------------------------\r\n Processing ' + filename + '\r\n--------------------------------------------------------\r\n')

          if (!err) {
          console.log(marked(content));
          outFile.write("<section><div class='lead'>")
          outFile.write( marked(content)+'\r\n');
          outFile.write("</div></section>\r\n\r\n");
          }

          cb(err);
        });
    },
    function(err, results){
      //Footer
      outFile.write(fs.readFileSync('scaffolding/bottom.html', 'utf8'));
      outFile.end();
      callback();
    }
  );
}

function renderFullPages(callback){
  
  // Now generate standalone pages
  var fullPagesToRender = ['renderthis/privacypolicy.md']
  var outFile = fs.createWriteStream('out/privacypolicy.html')

  outFile.on('error', function(err){console.log(err)});

  async.eachSeries(fullPagesToRender, 
    function(filename,cb){
        console.log('--------------------------------------------------------\r\n Processing ' + filename + '\r\n--------------------------------------------------------\r\n')
        outFile.write(fs.readFileSync('scaffolding/top-light.html', 'utf8'));
        fs.readFile(filename, 'utf8', function(err,content){
        outFile.write("<section><div class='lead'>")
        console.log(marked(content));
        outFile.write(marked(content)+'\r\n')
        outFile.write("</div></section>\r\n\r\n");
      });
    },
    function(err, results){
      //Footer
      outFile.write(fs.readFileSync('scaffolding/bottom-light.html', 'utf8'));
      outFile.end();
      callback();
    }
  );
}



async.series([renderMainPage, renderFullPages])

