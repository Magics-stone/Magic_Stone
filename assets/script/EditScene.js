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
        roleAtlas:{
            default: null,
            type: cc.SpriteAtlas
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    start: function() {
    	this.myrole = 0;
    	this.l_index = -1;
    	this.mySelect = [];
    },

    confirmCallBack: function(){
    	if (this.myrole>=4) {
    		return;
    	}
    	if (this.l_index===-1) {
    		return;
    	}
    	this.myrole++;
    	console.log("myrole:"+this.myrole);
    	cc.find("Canvas/"+"lbutton"+this.l_index).scale = 0.125; // minimize the size
    	var fileName;
    	switch(this.l_index)
    	{	
    		case 0:
    		fileName = "fashi"; //mage
    		break;
    		case 1:
    		fileName = "gongjianshou"; //Archer
    		break;
    		case 2:
    		fileName = "mushi"; //Priest
    		break;
    		case 3:
    		fileName = "zhanshi"; //warrior
    		break;
    	}
    	var node = new cc.Node();
    	var sprite = node.addComponent(cc.Sprite);
    	sprite.spriteFrame  = this.roleAtlas.getSpriteFrame(fileName); //create a sprite and add sprite image
    	sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
    	node.scale = 0.125;
    	node.width = 710;
    	node.height = 760;
    	node.position = cc.v2(314,178-115*(this.myrole-1)); // adjust the size and position
    	var button = node.addComponent(cc.Button);
    	var eventHandler = new cc.Component.EventHandler();
		eventHandler.target = this.node;
		eventHandler.component = "EditScene";
		eventHandler.handler = "rightClickCallBack";
		eventHandler.customEventData = node;
		button.clickEvents = [eventHandler];
    	this.node.addChild(node);
    	this.mySelect.push(node);
    	this.l_index=-1;
    },

    deleteCallBack: function(){
    	if (this.myrole===0) {
    		return;
    	}
    	for (var i = 0; i < this.mySelect.length; i++) {
    		if (this.mySelect[i].scale==0.15) {
    			this.mySelect[i].removeFromParent();
    			this.mySelect.splice(i,1);
    			this.myrole--;
    			break;
    		}
    	}
    	for (var i = 0; i < this.mySelect.length; i++) {
    		this.mySelect[i].position = cc.v2(314,178-115*(i));
    	}
    }, // delete the character that selected

    leftClickCallBack: function(type,data){
    	for (var i = 0; i < 4; i++) {
    		cc.find("Canvas/"+"lbutton"+i).scale = 0.125;
    	}
    	cc.find("Canvas/"+"lbutton"+data).scale = 0.175;
    	this.l_index = parseInt(data);
    }, // when click the character on left size , maximize it

    rightClickCallBack: function(type,data){
    	for (var i = 0; i < this.mySelect.length; i++) {
    		this.mySelect[i].scale = 0.125;
    	}
    	data.scale = 0.15;
    },// when click the character on right size , maximize it

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
