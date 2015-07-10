angular.module('musicPlayer', []).
	controller('musicCtrl', ['$scope','$interval', function ($scope, $interval) {
		var albumIndex = 0;	
		var library = [];
		var playedList = []; //track already played songs
		var intervalPromise;
		
		// initialization
		$scope.init = function(){
			$scope.playlist = [];
			library = [
				createAlbum("Album X",5),
				createAlbum("Album Y",10),
				createAlbum("Album Z",20)
			];
			$scope.currentAlbum = library[albumIndex];
			$scope.playSymbol = true;
			$scope.currentSong = null;
		}
 		
 		// create a random album
		createAlbum = function(name,count){
			var songArr = [];
			for(var i = 1; i<=count; i++){
				var randomLength = Math.random() * 120000 + 1000;
				songArr.push({"name":"Song " + i, "length":randomLength});
			}
			return {"name":name,"songs":songArr};
		}

		$scope.changeAlbum = function(direction){
			if(direction=="prev" && albumIndex>0){
				albumIndex-=1;
			}
			else if(direction =="next" && albumIndex < library.length-1){
				albumIndex+=1;
			}
			$scope.currentAlbum = library[albumIndex];
		}

		// play one song by double clicking the song, removes all other songs
		$scope.playSong = function(album,song){
			addToPlayedList($scope.playlist.length);
			$scope.playlist = [{"album":album,"song":song}];
			songPlaying(false);
		}

		// append to the end of the playlist
		$scope.queueSong = function(album,song){
			$scope.playlist.push({"album":album,"song":song});
			if(!$scope.currentSong){
				songPlaying(false);
			}
		}

		// add a whole album to playlist
		$scope.addAlbum = function(){
			var songs = $scope.currentAlbum.songs;
			for(var i = 0; i<songs.length; i++){
				$scope.playlist.push({"album":$scope.currentAlbum.name, "song":songs[i]});
			}
			if(!$scope.currentSong){
				songPlaying(false);
			}
		}
		// skip ahead on the playlist by double clicking
		$scope.skipSong = function(index){
			addToPlayedList(index);
			$scope.playlist = $scope.playlist.slice(index,$scope.playlist.length);
			songPlaying(false);
		}

		// if song is being played, add to played list
		addToPlayedList = function(index){
			if($scope.playlist.length > 0){
				for(var i = 0;i<index;i++){
					playedList.push($scope.playlist[i]);
				}
			}
		}

		// handle the current playing song
		songPlaying = function(resume){
			if(intervalPromise){
				// reset interval
				$interval.cancel(intervalPromise)
			}
			if($scope.playlist.length > 0){
				$scope.playSymbol = false;
				if(!resume){
					// not resuming a song, deep-copy first song on the playlist
					var currentSong = JSON.parse(JSON.stringify($scope.playlist.slice()));
					$scope.currentSong = currentSong[0];
					$scope.currentSong.song.length = 0;
				}
				// interval for song timing
				var timeleft = ($scope.playlist[0].song.length - $scope.currentSong.song.length) / 1000;
				intervalPromise = $interval(function(){
					$scope.currentSong.song.length += 1000;
				},1000,timeleft,true,null);
				// when song end add it to playedlist
				intervalPromise.then(function(){
					if($scope.playlist.length > 0){
						addToPlayedList(1);
						$scope.playlist.shift();
						songPlaying();
					}
				})
			}
			else{
				$scope.playSymbol = true;
				$scope.currentSong = null;
			}
		}	

		// pop from playedList and play that song
		$scope.previous = function(){
			if(playedList.length > 0){
				$scope.playlist.unshift(playedList[playedList.length-1]);
				playedList.pop();
				songPlaying(false);
			}
		}

		// calculate the position of the progress bar
		$scope.position = function(e){
			// handle firefox compatibility 
			var offset = e.offsetX === undefined ? (e.layerX - e.currentTarget.offsetLeft): e.offsetX;
			var percentage = offset / e.target.offsetWidth;
			$scope.currentSong.song.length = $scope.playlist[0].song.length * percentage;
			songPlaying(true)
		}

		// change play / pause button
		$scope.changePlaySymbol = function(){
			if($scope.playSymbol){
				$scope.playSymbol = false;
				songPlaying(true)
			}
			else{
				if(intervalPromise){
					$interval.cancel(intervalPromise)
				}
				$scope.playSymbol = true
			}
		}
	}])