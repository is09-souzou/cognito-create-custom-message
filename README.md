# cognito-create-custom-message
AWS Lambda

```
rm -Rf ./build
mkdir build
cp -Rf index.js build
cp -Rf node_modules build
cd build
zip -r handler.zip .
mv handler.zip ~/Desktop
cd ..
```
