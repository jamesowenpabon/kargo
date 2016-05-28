var ka = angular.module('kargoApp', ['ngRoute']);

ka.config( function($routeProvider, $controllerProvider, $locationProvider){ 
	$routeProvider
	//Home Page
	.when('/',{
		templateUrl: 'templates/routes/home.html',
		controller: 'home'
	})
	.when('/page1', {
		templateUrl: 'templates/routes/page1.html',
		controller: 'page1'
	})
	.when('/:rtPostId', {
		templateUrl: 'templates/routes/page2.html',
		controller: 'page2'
	})
})


//controllers
ka.controller('home', ['$scope', function($scope){
    $scope.hello = 'Kargo Code Sample';
}])

ka.controller('page1', ['$scope','dataSvc', function($scope, dataSvc){
	$scope.hello = 'Page One Scope Variable';
	dataSvc.getData('http://jsonplaceholder.typicode.com/posts')
	.then(function(response){
		$scope.postList = response.data;
	},function(response){
		$scope.postList = response.data;
	})
}])

ka.controller('page2', ['$scope', '$routeParams', 'dataSvc', 'normalizeSvc',  function($scope, $routeParams, dataSvc, normalizeSvc){
	$scope.hello = 'Page Two Scope Variable';
	$scope.postId = $routeParams.rtPostId;
	
	dataSvc.getData('http://jsonplaceholder.typicode.com/posts/'+$scope.postId)
	.then(function(response){
		$scope.post = response.data;
	},
	function(response){
		$scope.post = response.data;
	}
	)
	
	$scope.trackerParams = {
		"from" : "2015-01-01",
		"to": "2015-03-01"
	}
	
	dataSvc.getData('http://kargotest.herokuapp.com/api/trackers', $scope.trackerParams)
	.then(function(response){
		var d = response.data.data.sort(normalizeSvc.sortObj("date"));
		var p = $scope.trackerParams;
		$scope.tracker = normalizeSvc.start(d,p).concat(normalizeSvc.range(d,p),normalizeSvc.last(d,p));
	},
	function(response){
		parseData(response.data);
	}
	)
	
	
	
}])    

 
//Services
// Data Service
ka.factory('dataSvc', ['$http', function($http){
	var factory = {};
	factory.getData = function(api,prmtrs)	{
		return $http({method: 'get',url: api, params: prmtrs});
	}
	return factory;
}])

//Normalize array values service
ka.factory('normalizeSvc', [function(){
	range = function(array,prmtrs){
		var normalizedArray = [];
		array.forEach(function(c,i,a){
			cms = Date.parse(c.date);
			nms = a[i+1] ? Date.parse(a[i+1].date) : Date.parse(prmtrs.to);
			normalizedArray.push(a[i]);
			if(i !== a.length-1){
				var days = ((nms - cms)/86400000)-1;
				push.call(normalizedArray,days,c.date);
			}
		});
		return normalizedArray;
	} 
	start = function(array,prmtrs){
		var normalizedArray = [];
		var first = Date.parse(array[0].date)-Date.parse(prmtrs.from);
		var days = (first/86400000)-1;
		var offset = days < 0 ? false : true;
		console.log(days);
		push.call(normalizedArray,days,prmtrs.from,offset);
		return normalizedArray;
	}
	last = function(array,prmtrs)	{
		var normalizedArray = [];
		var last = Date.parse(prmtrs.to) - Date.parse(array[(array.length-1)].date);
		var days = last/86400000;
		push.call(normalizedArray,days,array[(array.length-1)].date);
		return normalizedArray;
	}
	push = function(iterator,startDate,offset){
		if(offset){this.push({"id": "NA","hits": 0,"date": startDate});}
		for (var x = 1; x <= iterator; x++) {
			var dt = new Date(Date.parse(startDate) + (86400000*x));
			var newDate = dt.toISOString().substring(0, 10);
			this.push({"id": "NA","hits": 0,"date": newDate});
		}
	}	
	sortObj = function(property) {
		return function(a,b){
			var fd = Date.parse(a[property]);
			var sd = Date.parse(b[property]);
			var result =  fd - sd;
			return result;
		}
	}
	return {
		range : range,
		start : start,
		last : last,
		sortObj : sortObj
	}
}]);


//Directives
//List all posts directive
ka.directive('listPosts', function(){
	return {
		scope: {
			content: '='
		},
		templateUrl: 'templates/directives/listPosts.html'
	}
})

//Display Post Detail
ka.directive('singlePost',function(){
	return {
		scope : {
			content : "="
		},
		templateUrl : "templates/directives/post.html"
	}
})

ka.directive('listObj', function(){
	return {
		scope: {
			content : "="
		},
		templateUrl : "templates/directives/object.html"
		
	}
})









