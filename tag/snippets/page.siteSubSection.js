/* /content/wknd/user01/en/adventures/bali-surf-camp.html
   The siteSubSectionLevel=6 in the above example is bali-surf-camp
   /content/wknd/user01/en/adventures.html
   /content/wknd/user01/en.html
   The siteSubSection above is ""
*/

var pathname;
pathname = window.location.pathname;
// pathname = "/content/wknd/user01/en/adventures/bali-surf-camp.html";

var siteSectionLevel = 6;
var pathNames = pathname.replace(".html","").split("/").filter(element => element);
if(pathNames.length > siteSectionLevel-1){
  //return the siteSectionLevel name
  console.debug("siteSubSection: " + pathNames[siteSectionLevel-1]);
  return pathNames[siteSectionLevel-1];
} else {
  return "";
}