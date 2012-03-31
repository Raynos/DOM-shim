REPORTER = spec

test: 
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--ui tdd \
		--reporter $(REPORTER)

.PHONY: test
