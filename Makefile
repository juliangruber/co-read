
test:
	@node_modules/.bin/mocha \
		--harmony \
		--reporter spec

example:
	@node --harmony example

.PHONY: test example
