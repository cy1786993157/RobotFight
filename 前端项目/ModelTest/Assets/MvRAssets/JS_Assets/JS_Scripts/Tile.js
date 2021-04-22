//This script simply holds info about a tile. A tile is the object which buildings can be placed upon.
#pragma strict

private var thisTransform:Transform;

//The building which is currently placed on this tile
var building:Transform;

//The stackable which is currently placed on this tile
var stackable:Transform;

function Start() 
{
	thisTransform = transform;
}