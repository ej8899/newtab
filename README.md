# newtab
Simple app to create a custom 'new tab' in chrome browsers - custom background images and links


# Attributes
"new tab" title icon by Alfan Zulkarnain from <a href="https://thenounproject.com/browse/icons/term/new-tab/" target="_blank" title="new tab Icons">Noun Project</a> (CC BY 3.0)

Favicon scraper:
https://faviconkit.com/


# Requirements
Requires Unsplash KEY to be into .htaccess environment variable:
SetEnv UNSPLASH_API_KEY "dfdsfdfdfsf"

Requires server PHP files for API cross functioning to occur
files are as in /server
note that newtab-version.php is simply a news file for the app itself - it relies on version.json to be in the same folder as this PHP file.  Update the JSON with app versioning as required.  The main app (extension) will pull from this API PHP to display any news to the end user if there is any.