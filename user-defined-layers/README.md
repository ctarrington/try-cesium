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
- [ ] use effect for the current cursor with lat, lon, screen x, y
- [ ] have a default new ref point 
- [ ] show the reference points on the map 
- [ ] update the active reference point as the cursor moves 
- [ ] use the static menu buttons to create a ref point and add to state
- [ ] show an editor when there is a new ref point active
- [ ] make a pane for the tree table
- [ ] show the reference points in a tree table 
- [ ] show a modal dialog for the reference point
- [ ] make the tree table collapsible
- [ ] turn off all the optional stuff in cesium
- [ ] 
- [ ] 
- [ ] 
- [ ] 
- [ ] 
