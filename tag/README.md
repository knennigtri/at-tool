# aep-tag-tool
https://www.npmjs.com/package/@knennigtri/aep-tag-tool

## Create an OAuth Config file for an Adobe Org

1. Go to the aio-projects [README.md](../aio-projects)

## Import a tag property into an organization

1. Run
```
   $ cd <this tag-property folder>
   $ aep-tag-tool 
      -c aio-projects/vlab2-us.json 
      -i wknd-tag.json 
      -s org-settings/vlab2-us-settings.yml 
      -t "z - WKND - Do Not Alter or Delete"
```
> Where **vlab2-us** is the org tenant
2. Repeat for all organizations


## Export

1. Create a new folder for the property in this project
2. Log onto vLabX-YZ Org that contains the property to export
3. Go to Data Collections > Tags and open the desired property
4. In the URL look for a value similar to: PR1234512345123451234512345
   1. Copy this property ID
5. Run
```
   $ aep-tag-tool -c environments/vLabX-YZ/<JWT JSON> -e <Property ID> -o ./new-folder
```
