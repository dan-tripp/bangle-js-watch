#!/usr/bin/env bash

set -uo pipefail
IFS=$'\n\t'  # Inspired by http://redsymbol.net/articles/unofficial-bash-strict-mode/.  Meant as a safety net.  You should still quote variable expansions.
function err_trap_func () {
	exit_status="$?"
  echo "Exiting with status \"$exit_status\" due to command \"$BASH_COMMAND\" (call stack: line(s) $LINENO ${BASH_LINENO[*]} in $0)" >&2
	exit "$exit_status"
}
trap err_trap_func ERR

function exit_trap_func () {
	true
}
trap exit_trap_func EXIT

set -o errtrace
shopt -s expand_aliases
#cd "$(dirname "$0")"
#set -o xtrace

nameOfThisProgram="$(basename "$0")"
dirOfThisProgram="$(realpath "$(dirname "$0")")"

numArgsMin=0
numArgsMax=0
if [[ ( "$#" -le "$numArgsMin"-1 ) || ( "$#" -ge "$numArgsMax"+1 ) || ( "$#" == 1 && "$1" == "--help" ) ]] ; then
	cat >&2 << EOF
Usage example(s): 
$nameOfThisProgram # no args 
EOF
	exit 1
fi

dest_dir=/tmp/bangle-js-run-walk-galloway-for-transfer-to-watch

if [[ -d "$dest_dir" ]] ; then 
	rm -r "$dest_dir"
fi
mkdir "$dest_dir"
sortOrderIdx=-1000
cat git-tags-to-transfer-to-watch | while read git_tag ; do 
	js_for_this_version_file_path="$dest_dir"/run-walk-galloway-"$git_tag".app.js
	git show "$git_tag":./run-walk-galloway.app.js > "$js_for_this_version_file_path"
	info_file_path="$dest_dir"/run-walk-galloway-"$git_tag".info
	cat << EOF > "$info_file_path"
{
        "id":"run-walk-galloway",
        "name":"Run/Walk $git_tag",
        "src":"$(basename $js_for_this_version_file_path)",
        "sortorder": $sortOrderIdx
}
EOF

	sortOrderIdx=$(($sortOrderIdx+1))

done
