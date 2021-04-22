/*This script changes an enemy's attributes after it loses health. For example you can make the enemy slow down as it loses health*/

#pragma strict

//Caching the transform for quicker access
private var thisTransform:Transform;

//How much health needs to be lost before changing attributes
var healthLoss:float = 20;
internal var healthLossCount:float = 0;

//Various attribute multipliers
var speedMultiplier:float = 2;
var attackDelayMultiplier:float = 0.5;
var damageMultiplier:float = 2;

//How many times to repeat the change
var repeat:int = 0;

//A special animation we can run when an attribute changes
var specialAnimation:AnimationClip;

function Start()
{
	thisTransform = transform; //Caching transform for quicker access
}

function Update() 
{
	//If the enemy loses enough health, apply the multipliers.
	if ( thisTransform.GetComponent(Enemy).health > 0 && healthLossCount >= healthLoss && repeat > 0 )
	{
		healthLossCount = 0;
		
		repeat--;
		
		//Multiply the enemy's attributes
		thisTransform.GetComponent(Enemy).speed *= speedMultiplier;
		thisTransform.GetComponent(Enemy).attackDelay *= attackDelayMultiplier;
		thisTransform.GetComponent(Enemy).damage *= damageMultiplier;
		
		//Play a special animation, and assign it as the default walk animation
		if ( specialAnimation )
		{
		    animation.Play(specialAnimation.name);
		    
		    thisTransform.GetComponent(Enemy).walkAnimation = specialAnimation;
		}
	}
}
