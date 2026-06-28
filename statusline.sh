#!/bin/bash

# Read JSON input from stdin
input=$(cat)

# Extract current directory from JSON
cwd=$(echo "$input" | jq -r '.workspace.current_dir // empty')

# Get current time
time=$(date +%H:%M:%S)

# Get model display name from JSON
model=$(echo "$input" | jq -r '.model.display_name // empty')

# Get context used percentage from JSON
context_used=$(echo "$input" | jq -r '.context_window.used_percentage // empty')

# Format context percentage
if [ -n "$context_used" ]; then
  context_str=$(printf " %.0f%% ctx" "$context_used")
else
  context_str=""
fi

# PS1 format: (cyan time) [cyan model] ○ [black bold user @ red bold host] magenta bold cwd [context%]
# \u → $(whoami), \H → $(hostname), \w → $cwd
printf "(\\033[0;36m%s\\033[39m) [\\033[0;36m%s\\033[39m] ○ [\\033[30;1m%s\\033[39m@\\033[31;1m%s\\033[39m] \\033[35;1m%s\\033[39m\\033[33m%s\\033[39m" "$time" "$model" "$(whoami)" "$(hostname -s)" "$(basename "$cwd")" "$context_str"
