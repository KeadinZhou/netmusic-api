# NetMusic-API

This api to NetMusic.

## Install
```
npm i
```

## Run

```
node app.js
```

## API List

### Get lyric of songs

```
/v1/lyric
id: Song_id
```

Example: `/v1/lyric?id=1390853266`

### Get the list of playlist

```
/v1/playlist
cat: Playlist_cat
offset: List_offset
limit: Count
```

Example: `/v1/playlist?cat=古风&offset=0&limit=35`

### Get comments of songs

```
/v1/music/comments
id: Song_id
offset: offset
limit: Count
```

Example: `/v1/music/comments?id=1390853266`

### Get detail of songs

```
/v1/music/detail
id: Song_id
```

Example: `/v1/music/detail?id=1390853266`

### Get URL of songs

```
/v1/music/url
id: Song_id
br: Song_Quality
```

Example: `/v1/music/url?id=1365898499&br=320000`

### Get detail of user

```
/v1/user/detail
id: User_id
```

Example: `/v1/user/detail?id=428793960`

### Get detail of playlist

```
/v1/playlist/detail
id: Playlist_id
```

Example: `/v1/playlist/detail?id=2979201561`
