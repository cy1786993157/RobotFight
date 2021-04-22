/*This script dispaly a simple start menu with some basic options: "START GAME" which is obvious, "Reset stats" which resets the game's PlayerPref stats back
to default, and "Unlock all levels" for developers who don't want to play through all levels. The GUI elements in this script are very primitive and are not
recommended for your full project. Instead you should consider using a more robust and advanced GUI system than what is available natively in Unity (21/8/2013)
such as EZGUI or NGUI.*/

#pragma strict

//@script ExecuteInEditMode
@script RequireComponent(LevelSelection)

//The title graphic
var title:Texture2D;

//general use index
private var index:int;

//List of custom menu items and their actions
var menuItems:MenuItems[];

class MenuItems 
{
    var caption:String = "Menu";
    var reciever:Transform;
    var action:String = "";
}

function Start() 
{
	//Disable the level selection component
	GetComponent(LevelSelection).enabled = false; 
}

var guiSkin:GUISkin;

function OnGUI()
{
	GUI.skin = guiSkin;
	
	//Display the title graphic
	if ( title )    GUI.Label( Rect( (Screen.width - title.width) * 0.5, 0, title.width, title.height), title);
	
	for ( index = 0 ; index < menuItems.length ; index++ )
	{
		//This button enables the level selection object, which we can choose levels from
		if ( GUI.Button( Rect( (Screen.width - menuItems[index].caption.Length * 20) * 0.5, Screen.height * 0.5 + 52 * index, menuItems[index].caption.Length * 20, 50), menuItems[index].caption) )
		{
			if ( audio )    audio.Play();
			
			menuItems[index].reciever.gameObject.SendMessage(menuItems[index].action);
		}
	}
}

function StartGame()
{
	//Disable the start menu component, while enabling the level selection component
	GetComponent(LevelSelection).enabled = true; 
	this.enabled = false;
}

function LoadLevel( levelName:String )
{
	Application.LoadLevel(levelName);
}

function LoadURL( urlName:String )
{
	Application.OpenURL(urlName);
}
