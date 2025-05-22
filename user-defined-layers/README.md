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
------------------------------
- [ ] figure out viewer order race thing
- [ ] on mac if you fly to before going to the map it dorks everything?!
- [ ] turn off filtering
- [ ] use name as group
- [ ] hide description in table?
- [ ] verify on another machine
------------------------------
- [ ] better names for rowData and newRowData
- [ ] on new, put it into drag mode from jump
- [x] use icons in the table
- [x] use icons in the buttons
- [ ] DRY out the models
- [ ] experiment with opacity and on mouse in and out
- [ ] Add a second model type - circle
- [ ] 
