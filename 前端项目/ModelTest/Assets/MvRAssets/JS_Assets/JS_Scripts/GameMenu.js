/*This script displays a simple menu that can be customized. You can set any number of items in the menu, and define which function they run in which object. 
You can also pass an extra String value to go with the function call .The GUI elements in this script are very primitive and are not
recommended for your full project. Instead you should consider using a more robust and advanced GUI system than what is available natively in Unity (21/8/2013)
such as EZGUI or NGUI.*/

#pragma strict

//general use index
private var index:int;

//List of custom menu items and their actions
var gameMenuItems:GameMenuItems[];

class GameMenuItems 
{
    var caption:String = "Menu";
    var reciever:Transform;
    var action:String = "";
    var parameter:String = "";
}

var guiSkin:GUISkin;

function OnGUI()
{
	GUI.skin = guiSkin;
	
	//Go through all the menu items and create a button for each
	for ( index = 0 ; index < gameMenuItems.length ; index++ )
	{
		//If we click on a button, run the corresponding function in the correct object		
		if ( GUI.Button( Rect( (Screen.width - gameMenuItems[index].caption.Length * 20) * 0.5, Screen.height * 0.5 + 52 * index, gameMenuItems[index].caption.Length * 20, 50), gameMenuItems[index].caption) )
		{
			if ( audio )    audio.Play();
			
			gameMenuItems[index].reciever.gameObject.SendMessage(gameMenuItems[index].action, gameMenuItems[index].parameter);
		}
	}
}

//A function that loads a URL by name
function LoadURL( URLaddress:String )
{
	if ( URLaddress != "" )
	{
		Application.OpenURL(URLaddress);
		
		this.enabled = false;
	}
}

//A function that loads a level by name
function LoadLevel( levelName:String )
{
	if ( levelName != "" )
	{
		Application.LoadLevel(levelName);
		
		this.enabled = false;
	}
}