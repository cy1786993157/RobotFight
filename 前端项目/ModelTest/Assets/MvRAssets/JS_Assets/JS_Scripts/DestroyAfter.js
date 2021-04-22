//This script destroys an object after some time. This is mainly used to destroy Shuriken particle systems which, for some wierd reason have no built in "one shot" 
//function, like the old Unity partcile system had.

#pragma strict

var destroyAfter:float = 5;

function Start() 
{
	Destroy(gameObject, destroyAfter);
}