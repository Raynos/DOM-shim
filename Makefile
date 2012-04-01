start:
	supervisor ./server.js

feature:
	firefox ./feature/test/test.html &

test:
	firefox ./test/test.html &

.PHONY: start test feature
