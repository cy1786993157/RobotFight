/*This script displays a grid of levels, some of which are locked. You can select a level to play. In the EnemyDispenser script, if you win a level, another
level is unlocked from the list of levels*/

#pragma strict

import UnityEngine.UI;

//@script ExecuteInEditMode

//Should we use the old Unity OnGUI instead of the new Unity (4.6+) UI
var useOldUI:boolean = false;

//The level name format that will be used throught the game. ex: "LEVEL" will be the prefix of all 
//the levels in the game, so the levels will be named "LEVEL1", "LEVEL2", etc
var levelNamePrefix:String = "LEVEL";

//A list of all available levels
var levelStatus:int[];

var levelButtons:Transform[];

function Start()
{
	//The size of a tile (button)
	tileSize.x = positionAndSize.width/grid.x;
	tileSize.y = positionAndSize.height/grid.y;
	
	//Calculate the size of the star icon based on the ratio between the tile size and the maximum number of stars
	starSize.x = tileSize.x/maxStarRatings;
	starSize.y = tileSize.y/maxStarRatings;
	
	//Set the level lock/unlock status
	SetLevelStatus();
}

var guiSkin:GUISkin;

//The grid of tiles/buttons
var grid:Vector2 = Vector2(4,2);

//The overall position and size of the tile grid
var positionAndSize:Rect = Rect();

//The size of a single tile
private var tileSize:Vector2 = Vector2();

//The size of the star icon based on the ratio between the tile size and the maximum number of stars
private var starSize:Vector2 = Vector2();

//general use index variables
private var indexLevel:int = 0;
private var indexA:int = 0;
private var indexB:int = 0;
private var indexC:int = 0;

//The graphic of the lock on a level tile
var lockIcon:Texture2D;

//The maximum possible star rating for a level
var maxStarRatings:float = 6;

//The image to display for a star and empty star rating
var starIcon:Texture2D;
var starEmptyIcon:Texture2D;

function Update()
{
	//If the level status is 0, then it's locked
	for ( indexLevel = 0 ; indexLevel < levelButtons.Length ; indexLevel++ )
	{
		if ( levelStatus[indexLevel] == 0 )
		{
			levelButtons[indexLevel].Find("StarsEmpty").gameObject.SetActive(false);			
			levelButtons[indexLevel].Find("StarsFull").gameObject.SetActive(false);
			levelButtons[indexLevel].Find("LockIcon").gameObject.SetActive(true);
			
			levelButtons[indexLevel].GetComponent(Button).interactable = false;
		}
		else
		{
			levelButtons[indexLevel].Find("StarsEmpty").gameObject.SetActive(true);			
			levelButtons[indexLevel].Find("StarsFull").gameObject.SetActive(true);
			levelButtons[indexLevel].Find("LockIcon").gameObject.SetActive(false);
			
			levelButtons[indexLevel].GetComponent(Button).interactable = true;
			
			levelButtons[indexLevel].Find("StarsFull").GetComponent(RectTransform).sizeDelta.x = levelButtons[indexLevel].Find("StarsEmpty").GetComponent(RectTransform).sizeDelta.x * ((levelStatus[indexLevel] - 1)/maxStarRatings);
		}
	}
		
}

function OnGUI()
{
	if ( useOldUI == true )
	{
		GUI.skin = guiSkin;

		GUI.Label( Rect( (Screen.width - 200) * 0.5, positionAndSize.y - 100, 400, 50), "SELECT A LEVEL");
		
		//Create the grid of buttons
		for ( indexA = 0 ; indexA < grid.y ; indexA++ )
		{
			for ( indexB = 0 ; indexB < grid.x ; indexB++ )
			{
				//If the level status is 0, then it's locked
				if ( indexLevel < levelStatus.Length )
				{
					if ( levelStatus[indexLevel] == 0 )
					{
						GUI.Label( Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), lockIcon);
					
					
					}
				}
				
				//If the level status is higher than 0, then it's unlocked
				if ( indexLevel < levelStatus.Length )
				{
					//Display a button with the level name, clicking it will take you to the corresponding level
					if ( GUI.Button( Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), "Level" + (indexLevel + 1).ToString()) )
					{
						if ( levelStatus[indexLevel] > 0 )    
						{
							if ( audio )    audio.Play();
							
							Application.LoadLevel("Level" + (indexLevel + 1));
						}
					}
					
					//Display the star rating for each level
					for ( indexC = 0 ; indexC < maxStarRatings ; indexC++ )
					{
						if ( indexC < PlayerPrefs.GetInt(levelNamePrefix + (indexLevel + 1)) - 1 )
						{
							if ( starIcon )
							{
								GUI.Label( Rect( positionAndSize.x + indexB * tileSize.x + starSize.x * (indexC + 0.2), positionAndSize.y + (indexA + 1) * tileSize.y - starSize.y * 1.2, starSize.x, starSize.y), starIcon);
							}
						}
						else if ( levelStatus[indexLevel] > 0 )
						{
							if ( starEmptyIcon )
							{
								GUI.Label( Rect( positionAndSize.x + indexB * tileSize.x + starSize.x * (indexC + 0.2), positionAndSize.y + (indexA + 1) * tileSize.y - starSize.y * 1.2, starSize.x, starSize.y), starEmptyIcon);
							}
						}
					}
				}
				else
				{
					GUI.Box( Rect( positionAndSize.x + indexB * tileSize.x, positionAndSize.y + indexA * tileSize.y, tileSize.x, tileSize.y), "");
				}
				
				indexLevel++;
			}
		}
		
		indexLevel = 0;
		
		//A button to return to the main menu
		if ( GUI.Button( Rect( (Screen.width - 300) * 0.5, Screen.height - 60, 300, 50), "Back To Menu") )
		{
			if ( audio )    audio.Play();
			
			GetComponent(StartMenu).enabled = true; 
			this.enabled = false;
		}
	}
}

//This function sets the level status for all levels, and saves them to PlayerPrefs
function SetLevelStatus()
{
	for ( indexC = 0 ; indexC < levelStatus.Length ; indexC++ )
	{
		//If there is no previous record of the level status, use the record in the game itself
		if( PlayerPrefs.HasKey(levelNamePrefix + (indexC + 1)) )
		{
			levelStatus[indexC] = PlayerPrefs.GetInt(levelNamePrefix + (indexC + 1));
		}
		else
		{
			PlayerPrefs.SetInt(levelNamePrefix + (indexC + 1), levelStatus[indexC]);
		}
	}
	
	PlayerPrefs.Save();
}

function ClearLevelStatus()
{
	//Remove all level status records from the levels
	for ( indexC = 0 ; indexC < levelStatus.Length ; indexC++ )
	{
		PlayerPrefs.DeleteKey(levelNamePrefix + (indexC + 1));
	}
	
	PlayerPrefs.Save();
	
	//Restart the level to make PlayerPrefs take effect
	Application.LoadLevel(Application.loadedLevelName);
}

function UnlockLevelStatus()
{
	//Set all levels status to "unlocked"
	for ( indexC = 0 ; indexC < levelStatus.Length ; indexC++ )
	{
		PlayerPrefs.SetInt(levelNamePrefix + (indexC + 1), 1);
	}
	
	PlayerPrefs.Save();
	
	//Restart the level to make PlayerPrefs take effect
	Application.LoadLevel(Application.loadedLevelName);
}