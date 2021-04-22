/*This script creates a money object every few seconds*/

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//The money object to be created
var moneyObject:Transform;

//The delay before creating money
var delay:float = 10;
private var delayCount:float = 0;

//The area in which this object may spawn
var spawnArea:Rect;

//The name of the animation to be played when money is produced
var moneyAnimation:String;

//How many seconds to wait before producing the shot from this weapon
var moneyAnimationTime:float = 0;

//Are we creating money right now?
private var isCreatingMoney:boolean = false;


function Start() 
{
	thisTransform = transform; //Caching transform for quicker access
}

function Update() 
{
	//Count up the delay
	delayCount += Time.deltaTime;
	
	//Create a new money object
	if ( delayCount >= delay && isCreatingMoney == false )
	{
		delayCount = 0;		
		
		CreateMoney(moneyAnimationTime);
		
		//Play the money animation, if available
		if ( animation )    
		{
			if ( moneyAnimation == "" )
			{
				if ( animation["attack"] )    animation.Play("attack");
			}
			else
			{
				if ( animation[moneyAnimation] )    animation.Play(moneyAnimation);
			}
			
		}
	}
}

function OnDrawGizmosSelected() 
{
	Gizmos.color = Color.blue;
	
	//Draw a gizmo of the money spawn area
	Gizmos.DrawLine(transform.position + Vector3(spawnArea.y,0,spawnArea.x), transform.position + Vector3(spawnArea.y,0,spawnArea.x + spawnArea.width));
	Gizmos.DrawLine(transform.position + Vector3(spawnArea.y,0,spawnArea.x + spawnArea.width), transform.position + Vector3(spawnArea.y + spawnArea.height,0,spawnArea.x + spawnArea.width));
	Gizmos.DrawLine(transform.position + Vector3(spawnArea.y + spawnArea.height,0,spawnArea.x + spawnArea.width), transform.position + Vector3(spawnArea.y + spawnArea.height,0,spawnArea.x));
	Gizmos.DrawLine(transform.position + Vector3(spawnArea.y,0,spawnArea.x), transform.position + Vector3(spawnArea.y + spawnArea.height,0,spawnArea.x));
}

//This function creates money with a delay
function CreateMoney( delay:float )
{
	isCreatingMoney = true;
	
	yield WaitForSeconds(delay);
	
	if ( moneyObject )
	{
		//Create a new money object within the spawn area
		var newMoney:Transform = Instantiate( moneyObject, thisTransform.position + Vector3(spawnArea.y,0,spawnArea.x), Quaternion.identity);
		
		//Place the money at a random position within the area limit
		newMoney.position.z += Random.value * spawnArea.width;
		newMoney.position.x += Random.value * spawnArea.height;
	}
	
	isCreatingMoney = false;
}