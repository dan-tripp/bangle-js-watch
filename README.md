
# Everyday coding 

- some JS idioms aren't supported eg. "Destructing Assignment".
	- source: https://www.espruino.com/Features 


# To cut a new version

- make your git commit. 
- run this: git tag vN # where N is what you want your new version number to be  
- if you want to install this new version on the watch, then:
	- edit git-tags-to-transfer-to-watch accordingly. 
	- run this: ./create-folder-for-transfer-to-watch.bash 
	- delete all files run-walk-v*-* on the watch 
		- i.e. in vscode, connect to the watch, "storage" (on the left), delete them one at a time.  there is no shift-click to multi-select.
		- leave run-walk-log.txt.  it's harmless. 
	- upload (to the watch) all files in the folder that the previous command created (which, at time of writing, is ~/tmp/bangle-js-run-walk-galloway-for-transfer-to-watch) 
		- there's an upload button, under "storage", shown only on mouse hover at the top right. 
- git push, presumably. 
