$(document).ready(function() {

    //initialize firebase
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
    const db = firebase.firestore();
    const storage = firebase.storage();

    //define firebase functions needed
    async function getCourseByRank(rank) {
        const query = await db.collection('courses').where('rank', '==', rank).get();
        let data = null;
    
        if (!query.empty) {
            const snapshot = query.docs[0];
            data = snapshot.data();
        }
        return data
    }
    
    async function getCourseImage(uri){
        var url = await storage.refFromURL(uri).getDownloadURL();
        return url;
    }
    
    async function getRandomRank(history, next){
        let usedRanks = []
        
        if(history && history.length > 0){
            history.forEach(data => {
                usedRanks.push(data["rank"])
            })
        }

        if(next && next.length > 0){
            next.forEach(data => {
                usedRanks.push(data["rank"])
            })
        }
    
        const courses = await db.collection('courses').get();
        const courseCount = courses.size;
        
        if(usedRanks.length > 0 && courseCount > usedRanks.length){
            let num = usedRanks[0]
            while(historyRanks.includes(num)){
                num = Math.floor(Math.random()*courseCount) + 1
            }
            return num
        
       } else {
           return Math.floor(Math.random()*courseCount) + 1
       }       
    }

    //setup the current tab page with the current data
    function setupPage(current, history=[], next=[], onload=true){
    
        $('#main').css('background-image', `url(${current.url})`);
        $(".course-name").text(current.name);
        $(".location").text(current.location);
        $(".par").text(current.par);
        $(".length").text(current.length);
        $(".description").text(current.description);
        $(".source").text(current.image.source);

        let architects = "";
        current.architects.forEach(a =>{
            architects = architects + `${a.name} (${a.year}), ` 
        });

        $(".architects").text(architects.substring(0, architects.length - 2));

        if(onload){
            setupEventListeners()

            $('body').show();

            updateStorage(current, history, next);
        }
    }

    function setupEventListeners(){
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

        $(document).on('mouseover', "#history .setup", function() {
            $(this).css({"opacity": 0.8})
        })

        $(document).on('mouseout', "#history .setup", function() {
            $(this).css({"opacity": 0.6})
        })

        $(document).on('click', "#history .setup", function() {
            $(this).css({"opacity": 1})

            let classes = $(this).attr('class');
            let index= parseInt($(this).attr('class')[classes.length-1]) - 1

            let history = localStorage.setItem("golfTabHistory", JSON.stringify(history))
            setupPage(history[index])

            $(this).css("opacity", 0.8)
        })
    }

    function setupHistory(history){
        for(let h = 0; h < history.length; h++){
            $(`#history .column.${h+1}`).css('background-image', `url(${history[h].url})`); 
            $(`#history .column.${h+1}`).attr('title', `${history[h].rank}. ${history[h].name})`); 
            $(`#history .column.${h+1}`).addClass("setup"); 
        }
    }

    function updateStorage(current, history, next){

        history.unshift(current);
        if(history && history.length > 6){
            history = history.slice(0,6);
        }
        
        localStorage.setItem("golfTabHistory", JSON.stringify(history));
        setupHistory(history)

        if(next && next.length == 3){
            getRandomRank(history, next).then(rank=>{
                getCourseByRank(rank).then((data)=>{
                    const random = Math.floor(Math.random()*data.images.length);
                    data.image = data.images[random];
                    getCourseImage(data.image.link).then(url=>{
                        data.url = url;
                        next.unshift(data);
                        next.slice(0,3);
                        localStorage.setItem("golfTabNext", JSON.stringify(next));
                        $("img#next-1").attr("src", next[0].url);
                        $("img#next-2").attr("src", next[1].url);
                        $("img#next-3").attr("src", next[2].url);
                    })
                })
            }).catch(error=>{
                console.log(`Error: ${error}`)
            });      
        }else{
            next = []

            for(let x = 0; x < 3; x++){
                getRandomRank(history, next).then(rank=>{
                    getCourseByRank(rank).then((data)=>{
                        const random = Math.floor(Math.random()*data.images.length);
                        data.image = data.images[random];
                        getCourseImage(data.image.link).then(url=>{
                            data.url = url;
                            next.unshift(data);
                            next.slice(0,3);
                            $(`img#next-${x+1}`).attr("src", next[x].url);
                            localStorage.setItem("golfTabNext", JSON.stringify(next));
                        })
                    })
                }).catch(error=>{
                    console.log(`Error: ${error}`)
                });      
            }
        }
          
        


    }




    //grab any local storage history
    let history = JSON.parse(localStorage.getItem('golfTabHistory') || "[]");
    let next = JSON.parse(localStorage.getItem('golfTabNext') || "[]");
    
    if(next.length > 0){
        console.log(next[2])
        let current = next[next.length-1]
        setupPage(current, history, next)
    } else {
        next = [];

        getRandomRank(history, next).then(rank=>{
            getCourseByRank(rank).then((data)=>{
                const random = Math.floor(Math.random()*data.images.length);
                data.image = data.images[random];
                getCourseImage(data.image.link).then(url=>{
                    data.url = url;
                    setupPage(data, history, next);
                })
            })
        }).catch(error=>{
            console.log(`Error: ${error}`)
        });      
    } 
});