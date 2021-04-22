/*This script defines a building's attributes, name, icon, price, health, cooldown etc. It is mostly accessed by the GameController script to display stats
in the build menu, and to check which tiles we can build on. A building may also have parts which are removed as it loses health*/

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//Basic attributes of a building
var buildingName:String = "Building";
var buildingSize:Vector2 = Vector2(1,1);
var icon:Texture2D;

//The cost of a building; how much of each resource type it costs
var moneyCosts:Cost[];

class Cost
{
	var moneyObject:Transform;
	var cost:int;
}

var price:int = 50;

var health:float = 100;
private var healthMax:float;
var coolDown:float = 5;


//Can this building be stacked on top of another?
var stackable:boolean = false;

//Which tiles we can place this building on
var allowedTiles:LayerMask;

//Enemy parts that fall off as it loses health
var parts:Transform[];
private var partsHealth:int;
private var partsLeft:int;

//Effect created when a unit dies
var deathEffect:Transform;

internal var listIndex:int;

//List of animations for this building
var idleAnimation:AnimationClip;

//A text description of this building, which can be displayed in a tooltip
var description:String = "";

function Start() 
{
	thisTransform = transform; //Caching transform for quicker access
	
	healthMax = health;
	
	//Calculate the health for each part of the building
	partsHealth = health/(parts.Length + 1);
	partsLeft = parts.Length;
}

function Update() 
{
	//If this object reaches 0 health, remove it from the game
	if ( health <= 0 )
	{
    	//Create a death effect if it's set
    	if ( deathEffect )    Instantiate( deathEffect, thisTransform.position, Quaternion.identity );
    	
    	Destroy(gameObject);
	}
	
	//If the building's health drops below the part health, remove that part
	if ( partsLeft > 0 && health <= partsLeft * partsHealth )
	{
		partsLeft--;
		
		//Remove the correct part if it's available
		if ( parts[partsLeft] )
		{
			//If the part has a Gib script, run it
			if ( parts[partsLeft].GetComponent(Gib) )
			{
				parts[partsLeft].GetComponent(Gib).enabled = true;
				
				parts[partsLeft].GetComponent(Gib).lane = thisTransform;
			}
			else //Otherwise, destroy it
			{
				Destroy(parts[partsLeft].gameObject);
			}
			
			parts[partsLeft].transform.parent = null;
		}
	}
	
	//If there is no other animation playing on this object, play its idle animation
	if ( animation )
	{
		if ( !animation.isPlaying )
		{
			if ( idleAnimation )
			{
				if ( animation[idleAnimation.name] )     animation.Play(idleAnimation.name);
			}
		}
	}
}

var guiSkin:GUISkin;

//The camera position
private var cameraPosition:Vector3;

//The relative healthbar position
var healthBarPosition:Rect;

//Draw a health bar relative to the building, which is visible when you hold 'H' key
function OnGUI()
{
	GUI.skin = guiSkin;
	
	if ( guiSkin )
	{
		if ( Input.GetKey(KeyCode.H) )
		{
			//If health is larger than 0, display a health bar on the building
			if ( health >= 0 )
			{
				cameraPosition = Camera.main.WorldToScreenPoint(thisTransform.position);
				
				cameraPosition.y = Screen.height - (cameraPosition.y - 50);
				
				GUI.Box( Rect( cameraPosition.x - healthBarPosition.x, cameraPosition.y - healthBarPosition.y, healthBarPosition.width, healthBarPosition.height), health.ToString() + "/" + healthMax.ToString(), "Healthbar Red" );
				
				GUI.Box( Rect( cameraPosition.x - healthBarPosition.x, cameraPosition.y - healthBarPosition.y, (health/healthMax) * healthBarPosition.width, healthBarPosition.height), "", "Healthbar Green" );
			}
		}
	}
}