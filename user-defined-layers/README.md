# React + TypeScript + Vite + SWC + Cesium

## Token
Your access token can be found at: https://cesium.com/ion/
If you don't have a token, you can create a free account and get one.

Once you have a token, set up a file called dontcheckin.ts in src/

The contents of src/dontcheckin.ts should look like
```aiignore
export const ACCESS_TOKEN = 'blahblahblah.secretstuf.blahblah';
```

## Get Started
```aiignore
nvm use    
npm i
npm run dev    
```


## Todo
- [x] have state at the top level for reference points
- [x] factor out the view creation to a useEffect
- [x] strip out the cesium boilderplate
- [x] make a pane for the tree table
- [x] show the reference points in a tree table
- [x] add buttons for a new folder or ref point
- [x] collapsed shows just buttons on the left
- [x] show a modal dialog for the new ref point
- [x] show a modal dialog from an action on the row
- [x] show the reference points on the map 
- [x] make a reference point editable on click
- [x] make a reference point be draggable during edit
- [x] error on drag when table is opened!?!? - use shadow billboard and leave current row alone till drag stops
- [x] add local storage
- [x] fly to on row icon
- [x] better looking edit modal
- [x] use icons in the buttons
- [x] figure out viewer order race thing
- [x] turn off filtering
- [x] use name as group
- [x] hide description in table
------------------------------
- [ ] refactor and use more use*
- [ ] need a way to edit folder names
- [ ] is there a better way split out the upsert logic?
- [ ] better names for rowData and newRowData
------------------------------
- [ ] better minimum size for the table? collapses down to nothing and the icons pop out and live absolute left?
- [ ] calculate the max and default percentages for the tree table from pixels? https://github.com/bvaughn/react-resizable-panels/issues/46#issuecomment-1368108416
- [ ] editable vs viewable state for modal pane
- [ ] on new, put it into drag mode from jump
- [ ] DRY out the models
- [ ] experiment with opacity and on mouse in and out
- [ ] Add a second model type - circle
- [ ] 
