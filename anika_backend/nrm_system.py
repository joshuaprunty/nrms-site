from openai import OpenAI

#UPDATES: Added story length to generate_new_story() input
#         Added function user_query() for user to query llm for updates after story generated


"""
Generates a news story based on inputs and rankings


inputs structure: List of tuples (content, rank)
story_types: enums (Article, Blog, Social)
story_length: int # of words user wants story to be
"""
def generate_news_story(inputs, story_type, story_length):

    # Sort inputs by rank in descending order (higher rank = more important)
    sorted_inputs = sorted(inputs, key=lambda x: x[1], reverse=False)

    # Get number of inputs
    num_inputs = len(inputs)

    # Processed inputs list
    processed_inputs = []

    # Traverse through and preprocess if the input is ranked in the second half and is too long
    for i in range(num_inputs):
        content, rank = sorted_inputs[i]
        if (i + 1) > int(num_inputs / 2) and len(content.split()) > story_length / num_inputs:
            #print("CALLING PREPROCCESSING ON ", content, "\n\n")
            content = preprocess_input(content, int((story_length / num_inputs) - (i * 10) + 10))  
        processed_inputs.append((content, rank))

    # Assign processed inputs back to sorted_inputs
    sorted_inputs = processed_inputs  

    # Debug print statements
    '''
    print("*********************\nInputs:")
    for content, rank in sorted_inputs:
        print(f"Rank: {rank}, Content: {content}\n")
    print("**************************\n\n")'''

    prompt = """
    The following details each have a rank. The higher the ranking (closer to 1), the more important the detail.\n 
    
    """

    #Type of story
    if story_type == "Article":
        prompt += "Write a professional news article based on the details, prioritizing higher rankings."
        prompt += "\nThe article should be objective, well-structured, and informative. Include an engaging lead paragraph, followed by a well-organized body with clear transitions, and a concluding paragraph that summarizes the impact of the event."
    elif story_type == "Blog":
        prompt += "Write a Blog post based on the details, prioritizing higher rankings."
        prompt += "\nThe blog should be opinionated, well-structured, and informative. Include an engaging lead paragraph, with clear arguments for the point the author wants to bring across."
    elif story_type == "Social":
        prompt += "Write a Instagram caption based on the details, prioritizing higher rankings."
        prompt += "\nThe post should be concise and easy to read with relevant hashtags."

    #Length of story
    prompt += "\nKeep the " + str(story_type) + " under " + str(story_length) + " words.\n"



    for i, (content, rank) in enumerate(sorted_inputs, 1):
        prompt += f"Detail {i} (Rank {rank}): {content}\n"


    response = client.chat.completions.create(model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=800)

    return response.choices[0].message.content

def preprocess_input(input, sum_length):
    prompt = "Summarize this text in under" + str(sum_length) + " words. Make sure to emphasize important details and notable quotes if applicable:"

    prompt += input

    response = client.chat.completions.create(model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=800)

    return response.choices[0].message.content


"""
Takes the generated story and the user's query and updates the story based on the query

story: string generated story
query: string user's query
"""
def user_query(story, query):
    prompt = "Here is my story:\n"
    prompt += str(story) + "\n"
    prompt += "Update the story so that " + str(query)

    response = client.chat.completions.create(model="gpt-4o",
    messages=[{"role": "user", "content": prompt}],
    max_tokens=800)

    return response.choices[0].message.content



def main():
    print("NRM System")
    '''
    num_inputs = int(input("Enter the number of elements you want to provide: "))
    inputs = []

    story_length = int(input("Enter the number of words you want in the story: "))
    
    for i in range(num_inputs):
        content = input(f"Enter content for element {i+1}: ")
        rank = int(input(f"Enter rank for element {i+1}: "))
        inputs.append((content, rank))

    print("\nGenerating news story...\n")
    story = generate_news_story(inputs, "Article", story_length)

    print(story)
    print("\n\n")

    #update = user_query(story, "Make it sound like a pirate wrote this")

    #print(update)

    '''

    story_length = 300
    inputs = []

    element_1 = """
                Severe Flooding Ravages Riverbend, Missouri: Community Faces Tragic Losses and Begins Recovery Efforts

Riverbend, MO – In the early hours of February 25, 2025, the town of Riverbend, Missouri, experienced catastrophic flooding as the Missouri River overflowed its banks following days of relentless rainfall. The deluge resulted in the tragic loss of three residents, the evacuation of over 200 families, and extensive damage to homes and infrastructure.

The National Weather Service reported that Riverbend received approximately 7 inches of rain over a 48-hour period, a volume that overwhelmed the town's levee system. The Missouri Department of Transportation has since closed multiple roadways due to high water levels, urging residents to avoid travel in affected areas. 
MODOT.ORG

Local emergency services, supported by the American Red Cross and the Federal Emergency Management Agency (FEMA), have established shelters for displaced individuals. FEMA has also deployed Disaster Recovery Centers in the region to assist residents with recovery efforts. 
FEMA.GOV

The community has rallied together, with volunteers providing meals, clothing, and support to those affected. As floodwaters begin to recede, officials emphasize the importance of safety during cleanup efforts and the need for continued support to rebuild the town.
                """

    element_2 = """
                Transcript: Emotional Interview with the Thompson Family

Location: Riverbend High School Gymnasium (Temporary Shelter)

Interviewer: Thank you for speaking with me during this difficult time. Can you share what happened when the flooding began?

John Thompson: (Taking a deep breath) It was around midnight when we heard the emergency alerts on our phones. I looked outside and saw the water rising rapidly. We grabbed what we could—important documents, some clothes—and got the kids into the car. But by then, the streets were already flooded.

Interviewer: That sounds terrifying. How did you manage to get to safety?

Emily Thompson: (Holding back tears) We tried driving, but the water was too high. Our car stalled, and we had to wade through waist-deep water to higher ground. I was so scared for the kids. Thankfully, a neighbor with a boat saw us and helped us get to the shelter.

Interviewer: I'm so sorry you went through that. Have you been able to return to your home to assess the damage?

John Thompson: Not yet. The authorities have said it's still too dangerous. But from what we've heard, our entire neighborhood is under water. We're preparing ourselves for the worst.

Interviewer: How are your children coping with all of this?

Emily Thompson: (Looking at her children playing nearby) They're confused and scared. Our youngest keeps asking when we can go home. We're trying to stay strong for them, but it's hard when we don't have answers ourselves.

Interviewer: What support have you received since arriving at the shelter?

John Thompson: The community has been incredible. The Red Cross provided us with blankets and toiletries. Local volunteers are serving hot meals. It's comforting to see everyone come together, but we know the road ahead is long.

Interviewer: What are your immediate needs, and how can people help?

Emily Thompson: Right now, we need information. When can we go back? What kind of assistance is available? Donations are helpful, but guidance on the next steps is what we're really seeking.

Interviewer: Is there anything else you'd like to share with our readers?

John Thompson: Just to hold your loved ones close. We lost material things, but we're grateful to be alive. And to thank everyone who's helping—we couldn't get through this without you.

Interviewer: Thank you, John and Emily. Your strength is inspiring, and our thoughts are with you and your family.

Emily Thompson: Thank you.

John Thompson: We appreciate it.

                """
    
    element_3 = """
                RIVERBEND, MO – While the stories of those who lost homes and loved ones in Riverbend’s catastrophic flooding have rightfully taken center stage, the efforts of volunteers working tirelessly to support the community have been nothing short of heroic. Among them is 34-year-old Marcus Green, a local teacher and lifelong Riverbend resident, who has been coordinating relief efforts at the town’s high school shelter.
In an exclusive interview, Green shared his perspective on the flood’s aftermath and the community’s response.

The Interview
[Your Name]: Marcus, thank you for taking the time to speak with us. Can you tell us how you got involved in the relief efforts?
Marcus Green: Of course. When the flooding started, I knew I had to do something. I’ve lived in Riverbend my whole life—this is my community. As soon as I heard the high school was being turned into a shelter, I came down to help.
[Your Name]: What have the past few days been like for you and the other volunteers?
Marcus Green: It’s been overwhelming, to be honest. The first night, we had over 200 people show up at the shelter. Families came in soaking wet, some with nothing but the clothes on their backs. We scrambled to get them blankets, food, and dry clothes. It was chaos, but everyone pitched in.
[Your Name]: What’s been the most challenging part of this experience?
Marcus Green: Seeing the pain on people’s faces. I’ve had students come through here with their families, and it’s heartbreaking. These are people I know—neighbors, friends. They’ve lost everything. And then there are the stories of those who didn’t make it out in time. It’s hard to process.
[Your Name]: Despite the challenges, what’s given you hope during this time?
Marcus Green: The way this community has come together. I’ve seen people who barely know each other hugging and comforting one another. Local businesses have donated food and supplies. Even kids from my school have been volunteering, handing out water and playing with the younger children to keep their spirits up. It’s reminded me why I love this town so much.
[Your Name]: What do you think Riverbend needs most right now?
Marcus Green: Right now, it’s about immediate needs—food, clothing, and a safe place to stay. But looking ahead, we’re going to need long-term support. People are going to need help rebuilding their homes and their lives. Mental health resources are going to be critical, too. This kind of trauma doesn’t just go away.
[Your Name]: What would you say to people outside of Riverbend who want to help?
Marcus Green: Donations are great, but we also need people to keep paying attention. This isn’t just a Riverbend problem—it’s a reminder of how vulnerable we all are to disasters like this. If you can, donate to organizations like the Red Cross or volunteer your time. And most importantly, don’t forget about us. Recovery is going to take months, maybe years. We’ll need support every step of the way.
[Your Name]: Thank you, Marcus. Your dedication is inspiring, and we’re grateful for everything you’re doing.
Marcus Green: Thank you. I’m just doing what anyone would do for their community.


                """


    inputs.append((element_1, 1))
    inputs.append((element_2, 3))
    inputs.append((element_3, 2))

    print("The following story prioritizes the objective report")
    #print("The following story prioritizes the emotional story")

    story = generate_news_story(inputs, "Article", story_length)
    print(story)

if __name__ == "__main__":
    main()