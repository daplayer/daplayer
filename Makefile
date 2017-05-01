package-osx:
	yarn package -- . --out dist --icon assets/icons/logo.icns --platform=darwin --arch=x64

package-linux:
	yarn package -- . --out dist --icon assets/icons/logo.ico --platform=linux --arch=x64
	yarn package -- . --out dist --icon assets/icons/logo.ico --platform=linux --arch=ia32

package-windows:
	yarn package -- . --out dist --icon assets/icons/logo.ico --platform=win32 --arch=x64
	yarn package -- . --out dist --icon assets/icons/logo.ico --platform=win32 --arch=ia32
