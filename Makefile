start:
	supervisor ./server.js

test:
	firefox ./test/test.html &

.PHONY: start test
