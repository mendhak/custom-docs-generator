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
      return `<h${level}><a name="${escapedText}" href="#${escapedText}">${text}</a></h${level}>`;
  } 
  else {
    return '<h' + level + '>' + text + '</h' + level + '>' + '\r\n\r\n';
  } 
}

function getTop(title, includeIntro){
    var top = fs.readFileSync('scaffolding/top.html', 'utf8');
    if(includeIntro){
      introHeader = fs.readFileSync('scaffolding/intro-header.html', 'utf8');
    }
    else {
      introHeader = "";
    }

    top = top.replace('###INTROHEADER###', introHeader);

    if(!title){
      title = ""
    } 
    else {
      title = title + " - ";
    }
    top = top.replace('###TITLE###', title);
    return top;
} 

function getBottom(includePics){
    var bottom = fs.readFileSync('scaffolding/bottom.html', 'utf8');
    bottom = bottom.replace('###YEAR###',new Date().getFullYear());


    if(includePics){
      footerPics = fs.readFileSync('scaffolding/footer-pics.html', 'utf8');
    } 
    else {
      footerPics = ""
    }

    bottom = bottom.replace('###FOOTERPICS###', footerPics);
    return bottom;

}

function getTitleFromContents(markdown){
  var firstPosition = markdown.indexOf('#');
  var endPosition = markdown.indexOf('\r');
  return markdown.substring(firstPosition, endPosition).replace('#','').trim();
}

function renderMainPage(callback){
  //Header
  var mdsToRender = ['renderthis/a1-mainscreen.md', 'renderthis/b1-features.md',  'renderthis/ss02-logging-details.md', 'renderthis/faq07-settings-changed.md', 'renderthis/faq11-remove-notification.md']
  var outFile = fs.createWriteStream('out/index.html')
  outFile.on('error', function(err){console.log(err)});
  //outFile.write(fs.readFileSync('scaffolding/top.html', 'utf8'));
  outFile.write(getTop(false,true));

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
      outFile.write(getBottom(true));
      outFile.end();
      callback();
    }
  );
}

function renderFullPages(callback){
  // Now generate standalone pages
  var fullPagesToRender = ['renderthis/privacypolicy.md']

  async.eachSeries(fullPagesToRender, 
    function(filename,cb){
        fs.readFile(filename, 'utf8', function(err,content){
             if (!err) {
                console.log('--------------------------------------------------------\r\n Processing ' + filename + '\r\n--------------------------------------------------------\r\n')
                var outFile = fs.createWriteStream('out/privacypolicy.html')
                outFile.on('error', function(err){console.log(err)});

                outFile.write(getTop(getTitleFromContents(content), false));
                outFile.write("<section><div class='lead'>")
                console.log(marked(content));
                outFile.write(marked(content)+'\r\n')
                outFile.write("</div></section>\r\n\r\n");
                outFile.write(getBottom(false));
                outFile.end();
             }
      });
    },
      function(err, results){
      callback();
    }
  );
}


async.series([renderMainPage, renderFullPages])

