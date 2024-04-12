# Download AIO Project JSON files

1. Go to https://developer.adobe.com/console/projects
2. Log into the desired organization
3. Create a new project:
   1. Title: ADLS API Automations
4. Create new API: 
   1. APIs: 
      1. **Experience Platform Launch API**
      2. **Adobe Target**
   2. authentication: OAuth Server-to-Server
   3. Product Profiles: 
      1. Launch - vLab#-###
      2. Default Workspace
5. Download the OAuth JSON
   1. Go to Credntials > OAuth Server-to-Server
   2. In the top right, click "Download JSON"
6. Save JSON as `vlabX-YZ.json`, where the name is the **tenant** of the Organization
   1. Example: https://experience.adobe.com/#/@vlab2-us/target/offers
      1. `vlab2-us`` is the **tenant**
7. Add the json file to this `/aio-projects` folder