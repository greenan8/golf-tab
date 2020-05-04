$(document).ready(function() {
    //Initialize firebase
    firebase.initializeApp({
        apiKey: "AIzaSyBX9z45rV_koqaFZjHxsU5Z-8jR7u74syQ",
        authDomain: "golf-tab.firebaseapp.com",
        databaseURL: "https://golf-tab.firebaseio.com",
        projectId: "golf-tab",
        storageBucket: "golf-tab.appspot.com",
        messagingSenderId: "1077373192681",
        appId: "1:1077373192681:web:79cd76c97bbf7e6ea42378",
        measurementId: "G-JJ2GWRM0G8"
    });
    const db = firebase.firestore()
    const storage = firebase.storage()

    //get cached data
        let request = window.indexedDB.open("golf-tab", 1);

        request.onerror = function() {
            console.log('Database failed to open');
        };

        request.onsuccess = function() {
            console.log('Database opened successfully');
  
        const db = request.result;
        };

    //set data
    $('#main').css('background-image', 'url(https://www.royalcountydown.org/images/resources/royalcountydown/new-home-slide-1.jpg)');
        //set other things like source, titles, history



    //add next to next and update history
    async function getCourseByRank(rank) {
        // Make the initial query
        const query = await db.collection('courses').where('rank', '==', rank).get();
        let data = null

        if (!query.empty) {
            const snapshot = query.docs[0];
            data = snapshot.data();
        }
        return data
    }

    async function getCourseImage(uri){


    }
    getCourseByRank(1).then((data)=>{
        console.log(data)
    });

    //website functionality
    $('button.history').click(function(){
        $('#history').slideToggle("slow", function(){
            if($('button.history i').hasClass('la-history')){
                $('i.la-history').removeClass('la-history').addClass('la-times');
            } else {
                $('i.la-times').removeClass('la-times').addClass('la-history')
            }
        });   
    });

    let timer = null
    $(document).mousemove(function(){
        $('#top-bar').fadeIn();
        clearTimeout(timer); // Reset the timer
        timer = setTimeout(function(){
            $('#top-bar').fadeOut();
        }, 2500);
    });
});