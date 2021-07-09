#version 410


layout (location = 0) in vec3 vertex;
layout (location = 1) in vec3 normal;
layout (location = 2) in vec2 vTexCoord;
layout (location = 3) in vec3 t;
layout (location = 4) in vec3 b;

 

uniform mat4 vertex_model_to_world;
uniform mat4 normal_model_to_world;
uniform mat4 vertex_world_to_clip; 

out VS_OUT {
	vec3 vertex;
	vec3 normal;
	vec3 t;
	vec3 b;
	vec2 texCoord;
} vs_out;

 

void main()
{  
	vs_out.t = t;
	vs_out.b = b;
	vs_out.texCoord = vTexCoord.xy;
	//transform to world
	vs_out.vertex = vec3(vertex_model_to_world * vec4(vertex, 1.0)); 
	vs_out.normal = normal;
	gl_Position = vertex_world_to_clip * vertex_model_to_world * vec4(vertex, 1.0);
}
