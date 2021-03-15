# Installation
* install npm if needed: https://www.npmjs.com/get-npm
* install npm packages
```
npm install
```
* build using webpack
```
npm run build
```
# Add extension to Chrome
* Head over to chrome://extensions
* Toggle "Developer mode" on.
* Click Load unpacked.
* Upload the dist folder to chrome
* The extension should now be available for use


# .env for environment variables for sensitive strings ie. tokens, api keys
* eg.
```
echo PASSWORD="example" > .env
```
* then load that value in the code with
```
process.env.PASSWORD
```

# TODO:
* make an actual UI with checkboxes for generate resume, generate cover letter, and a button for GIB JOB (to start scrape)
* do some auth with the backend
* figure out how to upload docs
