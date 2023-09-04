const ejs = require('ejs');
const { marked } = require('marked');
const path = require('path');
const { Transform } = require('stream');

/**/
const { htmlRenderer } = require('./htmlRenderer');
const { PATHS } = require('../scripts/constants');
const { BUILD, SRC } = PATHS;

marked.use({ renderer: htmlRenderer });

/**
 *
 */
function convert(content, template) {
  const htmlString = marked.parse(content);
  return fillTemplate(template, removeDraftMark(htmlString));
}

/**
 *
 */
function removeDraftMark(htmlString) {
  const headingPosition = htmlString.indexOf('<h1>');
  return htmlString.substr(headingPosition);
}

/**
 *
 */
function fillTemplate(template, content) {
  const title = content.match(/<h1[^>]*>([^<]+)<\/h1>/)[1];

  const paths = {
    toCss: path.relative(BUILD.HTML_FILES, BUILD.CSS_FILES),
    toIcons: path.relative(BUILD.HTML_FILES, BUILD.ICON_FILES),
    toPartials: path.join(process.cwd(), SRC.EJS_PARTIALS_FILES)
  };
  
  return ejs.render(template, {
    content: content,
    paths: paths,
    title: title
  });
}

/**
 *
 */
function convertor(templatePromise) {
  return new Transform({
    objectMode: true,
  
    transform(file, encoding, callback) {
      try {
        const htmlString = convert(file.contents.toString(), templatePromise);
        file.contents = Buffer.from(htmlString, 'utf8');
        
        this.push(file);
        callback();
      
      } catch (error) {
        callback(error);
      }
    }
  });
}


/**/
module.exports = {
  songConvertor: convertor
}
