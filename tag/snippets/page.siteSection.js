/* /content/wknd/user01/en/adventures.html
   The siteSectionLevel=5 in the above example is adventures
   /content/wknd/user01/en.html
   The siteSection above is en
*/

var pathname;
pathname = window.location.pathname;
// pathname = "/content/wknd/user01/en/adventures.html";

var siteSectionLevel = 5;
var pathNames = pathname.replace(".html","").split("/").filter(element => element);
if(pathNames.length > siteSectionLevel){
  //return the siteSectionLevel name
  // console.debug("siteSection: " + pathNames[siteSectionLevel-1]);
  return pathNames[siteSectionLevel-1];
} else {
  //return the last level in the path
  // console.debug("siteSection: " + pathNames[pathNames.length-1]);
  return pathNames[pathNames.length-1];
}