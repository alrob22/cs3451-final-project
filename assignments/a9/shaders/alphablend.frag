#version 330 core

/*default camera matrices. do not modify.*/
layout(std140) uniform camera
{
    mat4 projection;	/*camera's projection matrix*/
    mat4 view;			/*camera's view matrix*/
    mat4 pvm;			/*camera's projection*view*model matrix*/
    mat4 ortho;			/*camera's ortho projection matrix*/
    vec4 position;		/*camera's position in world space*/
};

/* set light ubo. do not modify.*/
struct light
{
    ivec4 att;
    vec4 pos; // position
    vec4 dir;
    vec4 amb; // ambient intensity
    vec4 dif; // diffuse intensity
    vec4 spec; // specular intensity
    vec4 atten;
    vec4 r;
};
layout(std140) uniform lights
{
    vec4 amb;
    ivec4 lt_att; // lt_att[0] = number of lights
    light lt[4];
};

/*input variables*/
in vec3 vtx_normal; // vtx normal in world space
in vec3 vtx_position; // vtx position in world space
in vec3 vtx_model_position; // vtx position in model space
in vec4 vtx_color;
in vec2 vtx_uv;
in vec3 vtx_tangent;

uniform float iTime;
uniform int row = 5;
uniform int col = 5;
float frame = 1;
uniform sampler2D tex_color;   /* texture sampler for color */

/*output variables*/
out vec4 frag_color;

void main()
{

    

    /* This if statement discard a fragment if its alpha value is below a threshold (for alpha blending) */
    float stepx = 300;
    float stepy = 300;
    vec2 texCoords = vec2(vtx_uv.x, vtx_uv.y)/6;
         
        texCoords.y += stepy * 1;
        texCoords.x += stepx * frame;
         
        texCoords.y += stepy * ((frame - (mod( frame, col))) / col);
        

    vec4 tex_color = texture(tex_color, texCoords);

    if(tex_color.a < 0.1)
    {
        discard;
    }

    frag_color = tex_color;
}