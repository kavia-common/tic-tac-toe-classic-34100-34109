#!/bin/bash
cd /home/kavia/workspace/code-generation/tic-tac-toe-classic-34100-34109/game_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

