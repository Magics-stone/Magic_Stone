var gameData = require("GameData");
cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,      // The default value will be used only when the component attaching
        //                           to a node for the first time
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        groupAtlas:{
            default: null,
            type: cc.SpriteAtlas
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    start: function(){
        this.myHp = [gameData["mage"]["hp"],gameData["archer"]["hp"],gameData["priest"]["hp"],gameData["warrior"]["hp"]]; //Array store data from gamedata
        this.enemyHp = gameData["enemy"]["hp"];
        this.enemyMaxHp = this.enemyHp;
        this.pokersMap = {
            attack:0,
            defend:1,
            speed:2,
            heal:3,
        };
        this.jobMap ={
            0:"mage",
            1:"archer",
            2:"priest",
            3:"warrior",
        };
        this.pokers = [];
        this.roles = []
        this.index = 0;
        this.canTouch = true;
        this.skill = ["none","none","none","none"];
        this.initMyGroup();
        for (var i = 0; i < 4; i++) {
            this.pokers.push(cc.find("Canvas/poker"+(i+1)));
            var node = cc.find("Canvas/MyCharacter"+(i+1));
            node.name = this.jobMap[i];
            node.getComponent(cc.Sprite).spriteFrame = this.groupAtlas.getSpriteFrame(this.jobMap[i]+"_1");
            this.roles.push(node);
            this.roles[i].getChildByName("hp").getComponent(cc.Label).string = this.myHp[i];
            this.roles[i].getChildByName("light").getComponent(cc.Sprite).spriteFrame = this.groupAtlas.getSpriteFrame(this.jobMap[i]+"_2");
        } //initialize poker
        cc.find("Canvas/EnemyCharacter").getChildByName("hp").getComponent(cc.Label).string = this.enemyHp; // show enemyhp
        this.roles[this.index].getChildByName("light").active = true;
        this.updatePokerStatus(this.roles[this.index].name);
        this.upgrade = false;
    },

    // Init my own group according to EditInterface.
    initMyGroup: function()
    {
        console.log(gameData.myGroup);
        for (var i = 0; i < gameData.myGroup.length; i++) {
            this.jobMap[i] = gameData.myGroup[i];
            this.myHp[i] = gameData[gameData.myGroup[i]]["hp"];
        }

    },

    skillEffect: function(target,data){
        switch(data)
        {
            case "attack":
            this.attackSkill(this.jobMap[this.index]);
            break;
            case "heal":
            this.healSkill();
            break;
        }
    }, // defined which skill was active

    pokerClickCallBack: function(target,data){
        if (this.canTouch===false) {
            return;
        }
        this.skill[this.index] = data;
        this.canTouch = false;
        var origin = this.pokers[this.pokersMap[data]].position;
        this.pokers[this.pokersMap[data]].runAction(cc.sequence(cc.moveTo(0.5,cc.v2(15,141)), cc.callFunc(this.skillEffect,this,data),cc.delayTime(0.5),cc.moveTo(0.5,origin),cc.callFunc(function(){
                this.roles[this.index].getChildByName("light").active = false;
                var arry = this.getRepeatIndex();
                if (this.index===arry[1]) {
                    this.enemySkill();
                    this.checkGameOver();
                }
                this.index = this.getNextIndex();
                this.canTouch = true;
                this.roles[this.index].getChildByName("light").active = true;
                this.updatePokerStatus(this.roles[this.index].name);
            }.bind(this))));
    }, // when the poker was clicked, move to the middle of screen then come back

    checkSkill: function(data)
    {
        switch(data)
        {
            case "attack":
                if (this.index===2) {
                    return false;
                }
                else
                {
                    return true;
                }
            case "defend":
                if (this.index===0||this.index==3) {
                    return true;
                }
                else
                {
                    return false;
                }
            case "speed":
                if (this.index===1||this.index==2) {
                    return true;
                }
                else
                {
                    return false;
                }
            case "heal":
                if (this.index===2) {
                    return true;
                }
                else
                {
                    return false;
                }
            default:
                return false;
        }
    }, // check which skill can be used


    // udpate poker status by job
    updatePokerStatus: function(job)
    {
        console.log("updatePokerStatus:"+job);
        switch(job)
        {
            case "mage":
                this.pokers[0].getComponent(cc.Button).interactable = true;
                this.pokers[1].getComponent(cc.Button).interactable = true;
                this.pokers[2].getComponent(cc.Button).interactable = false;
                this.pokers[3].getComponent(cc.Button).interactable = false;
                break;
            case "archer":
                this.pokers[0].getComponent(cc.Button).interactable = true;
                this.pokers[1].getComponent(cc.Button).interactable = false;
                this.pokers[2].getComponent(cc.Button).interactable = true;
                this.pokers[3].getComponent(cc.Button).interactable = false;
                break;
            case "priest":
                this.pokers[0].getComponent(cc.Button).interactable = false;
                this.pokers[1].getComponent(cc.Button).interactable = false;
                this.pokers[2].getComponent(cc.Button).interactable = true;
                this.pokers[3].getComponent(cc.Button).interactable = true;
                break;
            case "warrior":
                this.pokers[0].getComponent(cc.Button).interactable = true;
                this.pokers[1].getComponent(cc.Button).interactable = true;
                this.pokers[2].getComponent(cc.Button).interactable = false;
                this.pokers[3].getComponent(cc.Button).interactable = false;
                break;
        }


    },

    attackSkill: function(job){
        this.enemyHp -= gameData[job]["atk"];
        //If the enemy's blood is less than 50%,upgrade ATK to 150% of the origin.
        if (this.enemyMaxHp/2>=this.enemyHp && this.upgrade === false) {
            gameData["enemy"]["atk"]+=0.5*gameData["enemy"]["atk"];
            this.upgrade = true;
        }
        cc.find("Canvas/EnemyCharacter").getChildByName("hp").getComponent(cc.Label).string = this.enemyHp;
        this.checkGameOver();
    },

    healSkill: function()
    {
        var MinIndex = function(arry){
            var index = 0;
            for (var i = 0; i < arry.length; i++) {
                if (arry[i]<=arry[index]&&arry[i]>0) {
                    index = i;
                }
            }
            return index;
        }
        var i = MinIndex(this.myHp);
        this.myHp[i] += gameData["mage"]["atk"];
        this.roles[i].getChildByName("hp").getComponent(cc.Label).string = this.myHp[i];
    }, // heal the character which has lowest hp

    enemySkill:function()
    {
        for (var i = 0; i < this.roles.length; i++) {
            if (this.myHp[i]>0) {
                if (this.skill[i]==="defend") {
                    this.myHp[i] -= gameData["enemy"]["atk"]*0.5;
                }
                else if(this.skill[i]==="speed")
                {

                }
                else
                {
                    this.myHp[i] -= gameData["enemy"]["atk"];
                }
                this.roles[i].getChildByName("hp").getComponent(cc.Label).string = this.myHp[i];
                if (this.myHp[i]<=0) {
                    this.roles[i].active = false;
                }
                break;               
            }
        }
        this.skill = ["none","none","none","none"];
    },  //enemy attack action.

    checkGameOver: function()
    {
        if (this.enemyHp<=0) {
            cc.find("Canvas/win").active = true;
            cc.find("Canvas/gameover").active = true;
            this.canTouch = false;
        }
        var allDie = true;
        for (var i = 0; i < this.roles.length; i++) {
            if (this.roles[i].active) {
                allDie = false;
                break;
            }
        }
        if (allDie) {
            cc.find("Canvas/die").active = true;
            cc.find("Canvas/gameover").active = true;
            this.canTouch = false;
        }
    }, // check win or lose

    gameover: function()
    {
        cc.director.loadScene("MainInterface");
    },

    getRepeatIndex: function()
    {
        var first = 0;
        var end = 0;
        for (var i = 0; i < this.myHp.length; i++) {
            if(this.myHp[i]>0)
            {
                first = i;
                break;
            }
        }
        for (var i = 0; i < this.myHp.length; i++) {
            if(this.myHp[i]>0)
            {
                end = i;
            }
        }

        return [first,end];
    }, //defined first character and last character for action turn.

    getNextIndex: function()
    {
        for (var i = this.index+1; i < this.myHp.length; i++) {
            if(this.myHp[i]>0)
            {
                return i;
            }
        }

        for (var j = 0; j < this.index; j++) {
            if(this.myHp[j]>0)
            {
                return j;
            }
        }

        return this.index;
    } //defined which character should move next

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
