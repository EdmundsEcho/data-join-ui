# Usage

```fish
node find-prop-drilling.js ./react-tree/react-tree.ValueGridFileLevels.json
```

# generate the report

1. open vscode
2. run the start tree option (bottom right)
3. it will generate a report in ~/react-tree.json
4. cp ~/react-tree.json optimizing/react-tree.ComponentRoot.json
5. pass it to the js script `find-prop-drilling.js`
