const functions = require('firebase-functions');
const admin = require('firebase-admin');
const ContentBasedRecommender = require('content-based-recommender')
const recommender = new ContentBasedRecommender({
    minScore: 0.1,
    maxSimilarDocuments: 100
  });

const items = [
    {interest: "Photography", id:1, placetype: "florist travel_agency library aquarium amusement_park art_gallery museum mosque park shopping_mall supermarket tourist_attraction hindu_temple zoo"},
    {interest: "Research", id:2, placetype: "police post_office university lawyer airport museum book_store"},
    {interest: "Music", id:3, placetype: "movie_rental movie_theater night_club casino church shopping_mall"},
    {interest: "Vlogs", id:4, placetype: "taxi_stand train_station transit_station travel_agency subway_station library aquarium amusement_park art_gallery museum mosque park shopping_mall supermarket tourist_attraction hindu_temple zoo"},
    {interest: "Tech", id:5, placetype: "electronics_store store shopping_mall"},
    {interest: "Food", id:6, placetype: "meal_delivery meal_takeaway bar bakery cafe restaurant"},
    {interest: "Parks", id:7, placetype: "stadium zoo park museum bowling_alley art_gallery amusement_park aquarium"},
    {interest: "Cafes", id:8, placetype: "cafe"},
    {interest: "Books", id:10, placetype: "library book_store" },
    {interest: "Cars", id:11, placetype: "car_dealer car_rental car_repair car_wash gas_station"},
    {interest: "Movies", id:12, placetype: "movie_rental movie_theater"},
    {interest: "Education", id:13, placetype: "school secondary_school university"},
    {interest: "Shopping", id:14, placetype: "jewelry_store hardware_store home_goods_store hair_care grocery_or_supermarket supermarket furniture_store store florist shopping_mall electronics_store shoe_store drugstore doctor department_store dentist clothing_store convenience_store pet_store physiotherapist liquor_store locksmith   "},
    {interest: "Sports", id:15, placetype: "stadium campground bowling_alley"},
    {interest: "Culture", id:16, placetype: "hindu_temple mosque place_of_worship"},
        ];



admin.initializeApp(functions.config().firebase);


exports.helloWorld = functions.https.onRequest((request, response) => {
 response.send("Hello from Firebase!");
});


const createNotification = (notification)=>{

    return admin.firestore().collection('notifications').doc(`${notification.postUserId}`).collection('userNotifications')
    .add(notification)
    .then(doc=>console.log("notification added", notification))
}


exports.listenComments = functions.firestore
.document('comments/{postId}/userComments/{userCommentId}')
.onCreate((doc, context) =>{
    const comment = doc.data();
    const notification = {
        content : "Commented on",
        postId: `${context.params.postId}`,
        user: `${comment.username}`,
        userId: `${comment.userId}`,
        postUserId: `${comment.postUserId}`,
        time: admin.firestore.FieldValue.serverTimestamp()
    }

    return createNotification(notification);
});


const generateUserRecommendations = (userId, users)=>{
    recommender.train(users);
    const similarDocuments = recommender.getSimilarDocuments(userId, 0, 2);
    console.log(similarDocuments);
    admin.firestore().collection('userRecommendations').doc(`${userId}`).collection('recommendedUsers')
    .add({
        users: similarDocuments
    })
    .then(doc=>console.log("UserRecommendation added", doc))

}


calDistance = (lat1, lon1, lat2, lon2, unit) => {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 } //Kilometer
		if (unit=="M") { dist = dist * 0.8684 } //Miles 
		return dist;
	}
}

findNewCoordinates = (lat, lng) =>{

    let r_earth = 6371;

    // East 50km
    let lat1  = lat  + (50 / r_earth) * (180 / Math.PI);
    let lng1 = lng + (0 / r_earth) * (180 / Math.PI) / Math.cos(lat * Math.PI/180);
    let p1 = {lat1, lng1};
    
    // West 50km
    let lat2  = lat  + (0 / r_earth) * (180 / Math.PI);
    let lng2 = lng + (50 / r_earth) * (180 / Math.PI) / Math.cos(lat * Math.PI/180);
    let p2 = {lat2, lng2};
    
    // North 50km
    let lat3 = lat  + (-50 / r_earth) * (180 / Math.PI);
    let lng3 = lng + (0 / r_earth) * (180 / Math.PI) / Math.cos(lat * Math.PI/180);
    let p3 = {lat3, lng3};

    // South 50km
    let lat4 = lat  + (0 / r_earth) * (180 / Math.PI);
    let lng4 = lng + (-50 / r_earth) * (180 / Math.PI) / Math.cos(lat * Math.PI/180);
    let p4 = {lat4, lng4};
}



const updatePlacesRecommendations = (userId, lat, lng) =>{
    let followedUsers = [];
    let interestArrays = []; // Array of arrays
    let weightedInterestsArr = [];
    let currentUserInterestsArr = [];
    let overallInterests = [];
    let previousDestinationtypes = [];
    let overallInterestsTypes = [];
    
    // 1. GET ALL FOLLOWING USERS
    admin.firestore().collection('following').doc(`${userId}`).collection('userFollowing')
    .get()
    .then(snap => {
        snap.forEach(doc => {
            followedUsers.push(doc.id);
        });
    }).then(()=>{
    // 2. GET INTERESTS OF EACH FOLLOWED USER
       
    var promise = new Promise((resolve, reject)=>{

        if(followedUsers.length){
            
            var interestArrays = [];
            followedUsers.forEach(user => {
                admin.firestore().collection('users').doc(user)
                .get()
                .then((doc)=>{
                    if(doc.data().interested){
                        interestArrays.push(doc.data().interestsArr);
                    }
                }).then(()=>{
                    resolve(interestArrays);
                })
            });
        }
    });

    promise.then((interestArrays)=>{
        var promise = new Promise((resolve, reject)=>{

    // 3. GET WEIGHTAGE OF INTERESTS
        let interestTagArray = []; 
        console.log("Extra",interestArrays);
        if(interestArrays.length>0){
        interestArrays.forEach(interestArr => {
            interestArr.forEach(interest => {
                let foundObject = interestTagArray.find((o, i) => {
                        if (o.interest === interest) {
                            let count = o.count + 1;
                            arr[i] = { interest: interest, count: count, No: o.No };
                            return true; // stop searching
                        }
                    });
                    if(!foundObject){
                        let newObj = { interest: interest, count: 1, No: interestTagArray.length+1 };
                        interestTagArray.push(newObj);
                    }
                    
            });
        });

        interestTagArray.forEach(element => {
            let name = element.interest;
            let weight = element.count/interestArrays.length;
            
            if(weight>0.6){
                let weightedInterestObj = {interest: name, weight: weight*0.4}; // 40% for following users
                weightedInterestsArr.push(weightedInterestObj);
            }
        });
    }    

    resolve();    
    }); 
       
    promise.then(()=>{
        //3. Current User's Interests
        var promise = new Promise((resolve, reject)=>{
            
            admin.firestore().collection('users').doc(userId)
            .get()
            .then((doc)=>{
                if(doc.data().interested){
                    let interestsArr = doc.data().interestsArr;
                    console.log("My Interests", interestsArr);
                    interestsArr.forEach(element => {
                        let elementObj = {interest: element, weight: 0.6 } // 60% for current user
                        currentUserInterestsArr.push(elementObj);
                    });
                }
                resolve();
            });
        });
    promise.then(()=>{
        //4. Combine interests
        var promise = new Promise((resolve, reject)=>{
            
            if(currentUserInterestsArr.length || weightedInterestsArr.length){
                if(!currentUserInterestsArr.length){
                    // Only weightage of following users interests
                    overallInterests = weightedInterestsArr;
                }else if(!weightedInterestsArr.length){
                    // Only weightage of current user interests
                    overallInterests = currentUserInterestsArr;
                }
                else{
                    // Combine both type of Interests 60% user's and 40% followings
                    currentUserInterestsArr.forEach(interestObj => {
                        let comparedObj = weightedInterestsArr.find(o => o.interest === interestObj.interest);
                        if(comparedObj){
                            let weight = interestObj.weight + comparedObj.weight;
                            let newObj = { interest: interestObj.interest, weight: weight};
                            overallInterests.push(newObj);
                        }else{
                            overallInterests.push(interestObj);
                        }
                    });
                    
                    // Add the remaining Objs
                    weightedInterestsArr.forEach(interestObj => {
                        let comparedObj = overallInterests.find(o => o.interest === interestObj.interest);
                        if(!comparedObj){
                            overallInterests.push(interestObj);
                        }
                    });
                    
                    // Filter only whose interests which have weight >0.8
                    
                    let filtered = overallInterests.filter((interestObj)=>{ return interestObj.weight >= 0.7;});
                    overallInterests = filtered;
                }
        }
        
        //sorting interests from max weight to min
        overallInterests.sort((a, b) => {
        return b.weight-a.weight
    });
        
    let tempArr = [];
    // Keeping Just Interests ... removing weights
    overallInterests.forEach(element => {
        tempArr.push(element.interest);
    });
    overallInterests = tempArr;
    
    console.log("overallInterests", overallInterests);
    resolve();
});

promise.then(()=>{ // Overall iterests array is completed. 
    //  get travel history
    var promise = new Promise((resolve, reject)=>{
        
        let plans = [];
        admin.firestore().collection('plans').doc(`${userId}`).collection('userPlans').where('ended', '==', true)
        .get()
        .then((querySnap)=>{
            querySnap.forEach(plan => {
                plans.push(plan);
            });
            resolve(plans);
        });
    });
    
    promise.then((plans)=>{
        let types = [];

        if(plans.length){
            plans.forEach(plan => {
                types.push(plan.destinationTypes);
            });
            previousDestinationtypes.concat.apply([], types); // Merging elements of types into one single array
            previousDestinationtypes = Array.from(new Set(previousDestinationtypes)); // Removing Duplicates
        }
        
        // Now we've an overallInterestsArray and previousDestinationtypes
        // We need to query from this info
        
        console.log("2nd Prints",overallInterests); // [ interest]
            console.log("3rd Print", previousDestinationtypes); // [ food, cafe ] etc
            
            // Take all the places types according to interests
            
            overallInterests.forEach(interest => { 
                let comparedObj = items.find(o => o.interest === interest);
                overallInterestsTypes.push(comparedObj.placetype);
                
            });
        

            overallInterestsTypes.forEach(element => {
                console.log("Final Print", element);
                
            });
            // let stringTypes = overallInterestsTypes.toString();
            // stringTypes.
            
            // resolve();
            
    });    
})

});
});
});


// admin.firestore().collection('placesRecommendations').doc(`${userId}`).collection('recommendedUsers')
// .add({
    //     users: similarDocuments
    // })
    // .then(doc=>console.log("UserRecommendation added", doc))

});
}

exports.listenLocation = functions.firestore
.document('user/{userId}')
.onUpdate((doc)=>{
    
    let allusers = [];
    let updatedUserId = doc.after.id;
    let updatedUserLat = doc.after.data().location.latitude;
    let updatedUserLong = doc.after.data().location.longitude;

    return updatePlacesRecommendations(updatedUserId, updatedUserLat, updatedUserLong);

});


exports.listenInterests = functions.firestore
.document('users/{userId}')
.onUpdate((doc, context) =>{
    let allusers = [];
    let updatedUserId = doc.after.id;
    let updatedUserLat = doc.after.data().location.latitude;
    let updatedUserLong = doc.after.data().location.longitude;

    return admin.firestore().collection('users').where('interested', "==", true)
    .get()
    .then(users=>{
        users.forEach(user => {
            let currentUserLat = user.data().location.latitude;
            let currentUserLong = user.data().location.longitude;
            let distance = calDistance(updatedUserLat, updatedUserLong, currentUserLat, currentUserLong, 'K');
            
            if(distance < 100){  // within 100 Km

                let contentObj = {
                    id: user.id,
                    content: user.data().interestsArr.join(' ')
                }
                allusers.push(contentObj);
            }
        });
        console.log(allusers);
        generateUserRecommendations(doc.after.id, allusers);
        updatePlacesRecommendations(updatedUserId, updatedUserLat, updatedUserLong);
    });

    })