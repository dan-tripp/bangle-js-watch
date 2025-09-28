To cut a new version:
	- make your git commit. 
	- run this: git tag vN # where N is what you want your new version number to be  
	- if you want to install this new version on the watch, then:
		- edit git-tags-to-transfer-to-watch accordingly. 
		- run this: ./create-folder-for-transfer-to-watch.bash 
		- upload (to the watch) all files in the folder that the previous command created (at time of writing: /tmp/bangle-js-run-walk-galloway-for-transfer-to-watch) 
	- git push, presumably. 
