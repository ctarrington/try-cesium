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
------------------------------
- [x] strip out the cesium boilderplate
- [x] make a pane for the tree table
- [x] show the reference points in a tree table
- [x] add buttons for a new folder or ref point
- [ ] collapsed shows just buttons on the left
------------------------------
- [ ] show a modal dialog for the selected reference point
- [ ] make the tree table collapsible
- [ ] experiment with opacity and on mouse in and out
- [ ] New buttons on the bottom when full size?
- [ ] use effect for the current cursor with lat, lon, screen x, y
- [ ] have a default new ref point 
- [ ] show the reference points on the map 
- [ ] make an active reference point be draggable
- [ ] use the static menu buttons to create a ref point and add to state
- [ ] show an editor when there is a new ref point active
- [ ] turn off all the optional stuff in cesium
- [ ] DRY out the models
- [ ] Add a second model type - circle
- [ ] 
- [ ] 
- [ ] 
