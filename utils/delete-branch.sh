#!/bin/bash

# 현재 브랜치 이름 가져오기
current=$(git rev-parse --abbrev-ref HEAD)

# 현재 브랜치에서 숫자 추출
current_num=$(echo "$current" | sed -E 's/.*#([0-9]+).*/\1/')

# 현재 브랜치가 숫자가 없을 경우 종료
if ! [[ "$current_num" =~ ^[0-9]+$ ]]; then
  echo "❌ 현재 브랜치에서 숫자를 추출할 수 없습니다: $current"
  exit 1
fi

# 브랜치 목록 순회
git branch | sed 's/^[* ]//' | while read branch; do
  # 브랜치에서 숫자 추출
  branch_num=$(echo "$branch" | sed -nE 's/.*#([0-9]+).*/\1/p')

  # 숫자가 있고, 현재 브랜치보다 작고, 자기 자신이 아닌 경우
  if [[ "$branch_num" =~ ^[0-9]+$ ]] && [ "$branch_num" -lt "$current_num" ] && [ "$branch" != "$current" ]; then
    echo "🗑 삭제: $branch"
    git branch -D "$branch"
  fi
done

