.PHONY: test

package-osx:
	electron-packager . --out dist --icon assets/icons/logo.icns --platform=darwin --arch=x64

package-linux:
	electron-packager . --out dist --icon assets/icons/logo.ico --platform=linux --arch=x64
	electron-packager . --out dist --icon assets/icons/logo.ico --platform=linux --arch=x86

package-windows:
	electron-packager . --out dist --icon assets/icons/logo.ico --platform=windows --arch=x64
	electron-packager . --out dist --icon assets/icons/logo.ico --platform=windows --arch=x86

css:
	npm run less assets/stylesheets/default_theme.less assets/stylesheets/default_theme.css

test:
	npm run mocha test/{unit,models,helpers}/**/*_test.js
