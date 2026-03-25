---
title: "The AI Bubble Is Real and the Fallout Will Be Worse Than People Think"
date: "2026-03-25"
excerpt: "I work in AI. I believe we are inside a bubble. The capital misallocation is staggering, the revenue gap is structural, and the economic damage when it corrects will be harder to recover from than the dot-com crash. This post has been in the works for longer than I want to admit."
tags: ["AI", "Economics", "own exp", "not technical"]
---

This post has been in the works for longer than I want to admit. I have rewritten it probably six or seven times. Every time I thought I was done, some new funding round or infrastructure announcement would come out and I would have to update the numbers, adjust the framing, or just sit with the discomfort of saying something that sounds alarmist while working in the exact industry I am being alarmist about.

But I think the core argument has been stable for a while now, and continuing to wait for the perfect moment to publish it is just avoidance. So here it is.

I work in AI. I think the technology is genuinely important. I also believe we are inside a financial bubble, and that the economic consequences when it pops will be significantly worse than most people in the industry are willing to engage with seriously.

I am going to try to make this argument carefully, with numbers where I can, with historical comparisons where they are honest, and with uncertainty flags where I am guessing. This is not a manifesto, more of an attempt to think clearly about something that most of the people around me have strong financial incentives not to think clearly about.

## What I mean by bubble

I want to be precise because the word gets thrown around loosely.

A bubble is not just a situation where prices are high. Prices can be high for good reasons. A bubble is a specific market failure where asset prices are sustained by expectations of future returns that the underlying economics cannot plausibly deliver. The mechanism is self-reinforcing: high prices attract more capital, more capital funds more activity, more activity generates more narratives of growth, and more narratives justify even higher prices. The cycle continues until the gap between narrative and reality becomes too large for new capital to bridge.

The critical feature is not that everyone is wrong about the technology. Bubbles often form around real technologies. The internet was real during the dot-com bubble. Housing was a real asset class during the housing bubble. The mistake is not in identifying the technology as important. The mistake is in the implied financial model: assuming that because the technology is important, nearly any amount of investment in it will generate proportional returns.

That assumption is what I think is happening with AI right now. The technology is real. The investment thesis attached to it is not.

## The capital expenditure situation

The numbers are hard to overstate.

In 2025, the major cloud providers and AI infrastructure companies collectively spent somewhere north of 200 billion dollars on AI-related capital expenditure. That includes GPUs, custom silicon, data centers, power infrastructure, cooling systems, and the associated real estate and construction. Microsoft alone guided for roughly 80 billion. Meta was in the 60 billion range. Google, Amazon, and Oracle each committed tens of billions. And that is before counting the startups funded by venture capital that are buying the same hardware.

For reference, the entire US venture capital market deployed about 170 billion dollars total in 2024, across all sectors. The AI capex number from just a handful of hyperscalers is now larger than the entire VC ecosystem was a year ago.

The question that matters is: what revenue justifies this level of investment?

The most generous estimates for AI-related cloud revenue across all providers in 2025 were in the 50 to 80 billion dollar range. A lot of that is existing cloud workloads that have been relabeled as "AI" for investor relations purposes. The genuinely new revenue attributable to generative AI products, meaning revenue that would not exist without large language models and diffusion models, is harder to isolate, but the credible estimates I have seen put it significantly lower than the capex being deployed to chase it.

This is the first structural problem. The industry is spending four to five dollars on infrastructure for every dollar of new AI revenue it can identify. That ratio needs to improve dramatically, and quickly, or the returns on this capital will be deeply negative.

## Why the revenue gap is not closing fast enough

There is a standard rebuttal to this concern, which is that AI adoption is still early and revenue will catch up as enterprises integrate AI into their workflows. This is the "it is still early" argument, and it is the same argument that was used to justify every previous technology bubble.

Sometimes the argument is correct. Sometimes adoption really is early and revenue really does follow capital investment with a lag. The question is whether the specific dynamics of AI adoption support a lag that is short enough and a revenue ceiling that is high enough to justify the investment.

I do not think they do, for several reasons.

First, enterprise AI adoption is moving slower than the narrative suggests. The pattern I see from talking to people actually deploying AI in companies is: a pilot project gets approved, it shows promising results in a controlled setting, and then it stalls at the integration stage. The reasons are mundane but persistent. Data quality is poor. Internal systems are not designed for AI-augmented workflows. Legal and compliance teams have concerns. Middle management is skeptical. The productivity gains, while real in demos, are harder to measure in production environments with messy real-world data.

Second, the competitive dynamics are compressing margins before the market has fully formed. Every major cloud provider is offering AI services. Every major model lab is releasing increasingly capable models. Open source alternatives are closing the gap with proprietary models. The result is that AI services are being commoditized faster than they are being adopted, which puts structural downward pressure on the prices companies can charge.

Third, the most valuable AI use cases turn out to be the hardest to monetize at scale. Code assistance, the most obviously useful application of large language models, is being given away or sold at thin margins as a competitive moat for developer platforms. Search augmentation is being absorbed into existing search products without generating new revenue streams proportional to the cost. Content generation is useful but faces pricing pressure from the sheer number of competitors.

The enterprise use cases that could justify premium pricing, things like autonomous agents, complex reasoning systems, and domain-specific expert tools, are the ones that are furthest from reliable deployment. They require the highest capability models, the most careful safety work, and the longest sales cycles. By the time they are ready for production, the models powering them will likely be commodities.

## The dot-com comparison and why this might be worse

People keep making the dot-com comparison, and I think it is directionally right but structurally understates the problem.

The dot-com bubble had a few features that limited its economic damage. First, the overinvestment was primarily in relatively cheap infrastructure: fiber optic cable, web servers, office space for startups, and stock options for employees. The total capital destroyed when the bubble popped was significant but bounded. Most of the excess was in equity valuations, not physical infrastructure. When Pets.com went bankrupt, the warehouse and the servers had some residual value. The fiber optic cable that was laid during the boom turned out to be genuinely useful a decade later.

Second, the dot-com crash was concentrated in a specific sector. It devastated the tech workforce and Silicon Valley real estate, but the broader economy, while affected, was not structurally dependent on the survival of web startups. The 2001 recession was real but relatively mild by historical standards.

The AI bubble has different structural properties that I think make the potential damage larger.

The capital being deployed is physical and expensive in a way that dot-com spending mostly was not. Data centers cost billions of dollars. They take years to build. They require enormous amounts of power, water, and specialized equipment. They are not easily repurposed. A data center optimized for GPU-heavy AI workloads is not the same as a general-purpose data center, and if AI demand does not materialize at the expected scale, the overcapacity will be extremely expensive to maintain, difficult to sell, and in many cases stranded.

The power infrastructure commitments are even more concerning. Multiple companies have signed multi-decade power purchase agreements, including deals to restart nuclear plants and build entirely new power generation facilities, specifically to service AI data center demand. These are twenty- and thirty-year commitments backed by demand projections that assume sustained exponential growth in AI compute. If those demand projections are even moderately wrong, the financial exposure is enormous and the assets are essentially non-transferable.

The geographic concentration is also different. AI infrastructure investment is flowing into a relatively small number of regions, creating local economic dependencies that will amplify the damage if investment pulls back. Towns that are building entire economies around data center construction and operation will face severe downturns. Power grids that have been planned around AI demand growth will face stranded capacity costs that get passed to ratepayers.

## The labor market problem

This is the part I find most concerning and the part that I think receives the least honest analysis.

The AI industry is not just overinvesting in hardware. It is also reshaping labor markets in ways that will be very difficult to reverse.

On the displacement side, AI tools are already reducing demand for certain categories of knowledge work. Content writing, basic code generation, customer support, data analysis, translation, and various forms of administrative work are all seeing measurable displacement. The displacement is not total, most of these jobs still exist, but the marginal demand for additional workers in these categories is declining. Companies are filling fewer positions and expecting existing workers to use AI tools to cover the gap.

The standard economic argument is that technology-driven displacement is always temporary because new industries and job categories emerge to absorb the displaced workers. I understand this argument, and historically it has been correct. But I think there are features of AI displacement that make the transition harder than previous technology transitions.

The speed is one factor. Previous waves of automation took decades to fully roll out. Factories did not automate overnight. ATMs did not replace bank tellers in a year. AI tools are being deployed to millions of knowledge workers simultaneously, and the performance of these tools is improving on a timeline measured in months, not decades. The economy's absorption mechanisms, retraining programs, new industry formation, geographic mobility, are all slow processes that assume displacement happens gradually.

The breadth is another factor. Previous automation waves tended to hit specific sectors or specific skill bands. AI tools are affecting a much broader cross-section of the knowledge economy simultaneously. It is not just one industry adapting. It is many industries facing similar pressures at the same time, which means the displaced workers are competing for the same shrinking pool of AI-complementary roles.

The skill mismatch is a third factor. Many of the jobs being created by the AI industry are highly specialized engineering and research positions. The jobs being displaced are mid-skill knowledge work positions. The idea that a displaced content writer or data analyst will retrain into an ML engineer is not realistic at scale. The educational requirements, the aptitude distribution, and the time required for meaningful retraining all work against rapid absorption.

On the creation side, the AI industry itself employs far fewer people than the economic activity it is disrupting. The major AI labs have a few thousand employees each. The cloud providers have more, but the AI-specific headcount is a fraction of their total workforce. The entire AI industry, including startups, probably employs fewer than 500,000 people in the US. The number of knowledge workers whose job content is being materially altered by AI tools is probably in the tens of millions.

This arithmetic does not work. You cannot displace demand for millions of mid-skill workers and replace it with demand for hundreds of thousands of high-skill workers and expect the labor market to equilibrate smoothly. The surplus has to go somewhere, and where it goes in practice is lower-paying service work, underemployment, or withdrawal from the labor force entirely.

## The wealth concentration problem

The financial gains from AI are concentrating in a very small number of entities. The big model labs, the cloud providers, and the GPU manufacturers are capturing the overwhelming majority of the economic value. Nvidia alone has added over two trillion dollars in market capitalization since the AI boom began. The top five or six companies driving AI infrastructure represent a historically unusual concentration of market value.

This matters for the bubble analysis because concentrated gains create concentrated risk. If Nvidia's revenue growth slows because AI capex plateaus, the market impact will not be proportional to Nvidia's size. It will cascade through the entire AI narrative, because Nvidia's revenue growth is the single most cited proof point for the AI investment thesis. A significant miss on Nvidia earnings would trigger repricing across every company that has repositioned around AI, which at this point is most of the S&P 500.

The wealth concentration also matters for the recovery analysis. When economic gains are concentrated in a small number of companies and their employees, the multiplier effects are limited. A thousand Nvidia employees getting stock windfalls does not generate the same economic activity as a hundred thousand workers getting moderate raises. The spending patterns are different, the geographic distribution is different, and the economic resilience is different.

## Why the market is not pricing this correctly

Efficient market theory would suggest that if the bubble analysis is correct, the market should already be pricing the risk. Why is it not?

I think there are several compounding factors.

First, the incentive structure is heavily skewed toward optimism. Analysts who cover AI companies face career risk from being bearish. Fund managers who underweight AI stocks face underperformance risk relative to their benchmarks. CEOs who express doubt about AI investment face board pressure and stock price declines. Journalists who write skeptical AI stories get less engagement than journalists who write breathless AI stories. The entire information ecosystem around AI has a structural long bias.

Second, the uncertainty is genuinely high, and uncertainty tends to resolve in favor of existing narratives until a hard falsification event occurs. People know the numbers are stretched. They also know that the technology is real and improving rapidly. In the presence of genuine uncertainty, humans tend to anchor to the more exciting scenario, especially when that scenario is being reinforced by social proof and financial incentives.

Third, the timeline mismatch is important. The people making AI investment decisions today will, in many cases, not be the people dealing with the consequences if those investments do not pay off. CEOs have three- to five-year time horizons. Fund managers are evaluated quarterly. Venture capitalists have seven- to ten-year fund lives but raise their next fund based on current portfolio marks, not eventual returns. The people who will live with the economic fallout are workers, communities, and taxpayers, none of whom have a seat at the table where capex decisions are being made.

Fourth, and I think this is underrated, the AI narrative has become intertwined with national security and geopolitical competition in a way that makes it very difficult to challenge. Arguing against massive AI investment feels like arguing against national competitiveness. The framing has shifted from "is this a good investment?" to "can we afford not to invest?" That reframing makes it much harder to have an honest conversation about whether the specific investments being made are proportionate to the actual returns they will generate.

## What I think the correction looks like

I do not think the bubble ends with a single dramatic event. I think it ends with a slow repricing that unfolds over two to four years as the revenue gap fails to close.

The first phase is already arguably underway: capex growth decelerates. Not because companies lose faith in AI, but because CFOs start pushing back on the returns from the last round of spending. Quarterly reviews show that the new GPU clusters are running at lower utilization than projected. Enterprise AI contracts are growing slower than the sales forecasts assumed. The guidance starts to moderate.

The second phase is narrative erosion. A few high-profile AI startups fail or get acquired at down rounds. A major enterprise AI deployment gets publicly criticized for underperforming. The media cycle shifts from "AI is transforming everything" to "AI hype meets reality." Analyst reports start including more cautious language. This phase does not crash stock prices immediately, but it removes the narrative support that was sustaining the premium valuations.

The third phase is the repricing itself. It does not require AI to stop working or to be exposed as useless. It just requires the market to price AI companies based on their actual revenue and margin trajectory rather than on optimistic projections of future dominance. For many companies, that repricing will be severe, because the current valuations are pricing in outcomes that assume market sizes and adoption rates that are not materializing.

The fourth phase is the real economy impact. Reduced AI investment means reduced construction, reduced hiring in AI-adjacent roles, reduced demand for power infrastructure, and reduced activity in the communities that were building around data center economies. Displaced knowledge workers who were waiting for the labor market to absorb them find that the absorption is not happening because the AI companies are now contracting rather than expanding.

## Why the recovery will be harder than expected

Here is where I think the analysis diverges most sharply from the optimistic consensus.

Previous technology-driven economic corrections were followed by recoveries that were driven, in part, by the technology itself. The dot-com crash was followed by the maturation of the internet into a genuine productivity tool and a platform for new businesses. The infrastructure that was overbuilt during the bubble, the fiber optic cable and the data centers and the web development skills, turned out to be useful once the market repriced and companies started building on realistic business models.

The AI correction will be different because the technology continues to improve while reducing demand for labor. This is the essential asymmetry that makes recovery harder. In previous corrections, the recovery created jobs. In this correction, the technology that caused the bubble continues to operate and improve even after the investment bubble pops, which means the labor displacement does not reverse.

A company that laid off twenty content writers and replaced them with AI tools does not rehire those twenty writers when the AI bubble pops. The tools still work. A company that automated half of its customer support does not rebuild the call center. A company that used AI to reduce its junior engineering headcount does not reverse that decision because Nvidia's stock dropped.

This means the recovery has to come from genuinely new economic activity that is not a direct substitute for AI-displaced work. And the problem is that nobody has a credible theory of what that activity is at the scale required to absorb the displacement.

The usual invocations are healthcare, education, green energy, and care work. These are real sectors with real growth potential. But they face their own constraints: regulatory barriers, reimbursement structures, capital requirements, and in the case of care work, persistent undervaluation and low pay. The idea that these sectors will smoothly absorb millions of displaced knowledge workers on a timeline that prevents serious economic hardship is, I think, more hope than analysis.

## The monetary policy complication

This is a subtlety that I think gets missed in most bubble analyses.

If the AI bubble correction happens during a period of already elevated interest rates, the monetary policy response is constrained. The standard playbook for a recession driven by asset price collapse is to cut rates aggressively, which lowers borrowing costs, stimulates investment, and supports asset prices. But if rates are already being held to manage inflation, the central bank faces a tradeoff between supporting the economy and maintaining price stability.

The situation is further complicated by the fiscal implications of AI infrastructure investment. Much of the power infrastructure being built for AI is being subsidized, directly or indirectly, by government programs tied to energy policy and industrial strategy. If AI demand disappoints, those subsidies become stranded commitments that add to fiscal pressure without generating the economic returns they were designed to enable.

I am not an economist and I do not want to overstate my competence here. But the basic structural observation seems important: the economic correction from an AI bubble will hit at a time when the policy toolkit for managing corrections is already constrained by prior commitments and competing priorities.

## The startup graveyard problem

There is a specific pattern in the AI startup ecosystem that I think deserves its own section because it illustrates the bubble dynamics at the micro level.

A typical AI startup in this cycle follows a recognizable trajectory. A team of strong engineers, often from a major lab, raises a seed round on the strength of a demo and a narrative about a large addressable market. The seed round is oversubscribed because investor demand for AI deals massively exceeds the supply of credible teams. The valuation at seed is higher than it would be in any other sector by a factor of three to five.

The team uses the capital to train or fine-tune a model, build a product wrapper, and sign a few design partners. The design partners are usually large companies that are eager to experiment with AI but not yet committed to paying production-scale prices. The startup reports "partnerships" and "enterprise interest" in its next fundraising deck.

Series A follows quickly, often within six to nine months, at a valuation that is two to three times the seed round. The justification is growth potential, not revenue. Revenue at this stage is typically negligible or in the low hundreds of thousands, often composed of pilot contracts that convert to recurring revenue at uncertain rates.

The problem arrives at the transition from pilot to production. Enterprise customers discover that the model performance degrades on their specific data. The accuracy that looked impressive in demos does not hold up on messy internal documents or domain-specific tasks. The integration cost is higher than expected. The legal review takes longer. The budget approval process stalls because the ROI case does not survive scrutiny from the CFO's office.

Meanwhile, the base models keep improving. The capability that the startup built proprietary infrastructure to deliver six months ago is now available through an API call to a general-purpose model at a fraction of the cost. The startup's moat, which was already thin, evaporates. The team pivots to a more specialized use case, burns through more capital, and either raises a down round, gets acqui-hired, or shuts down.

This is not a theoretical pattern. I have watched it happen to multiple companies I know personally, and the dynamics are almost comically predictable. The startups are not bad companies. The teams are not incompetent. The problem is that they raised capital at valuations that assumed market conditions which did not materialize, and the speed at which foundation models improve makes it nearly impossible to build a durable competitive position at the application layer.

The aggregate effect of hundreds of these startups failing will not be a single headline event. It will be a slow bleed of capital, talent, and confidence that accumulates over a few years and contributes to the broader narrative erosion I described earlier.

## The second-order effects nobody talks about

When people discuss the AI bubble, they tend to focus on the first-order effects: stock prices, corporate earnings, and direct employment in the AI industry. But the second-order effects are where the real economic damage accumulates, and they are much harder to reverse.

Real estate markets in AI hub cities have already repriced based on AI industry growth assumptions. San Francisco, Austin, Northern Virginia, and several international hubs have seen commercial and residential real estate valuations incorporate sustained growth in AI sector employment and data center demand. If that growth disappoints, the real estate correction will affect property owners, mortgage holders, local tax bases, and the construction industry simultaneously.

Higher education has pivoted aggressively toward AI. Universities have launched AI programs, hired AI faculty, and repositioned their marketing around AI career outcomes. Students are making six-figure educational investments based on the assumption that AI skills will command premium salaries for the foreseeable future. If the labor market for AI roles contracts significantly, those students face a debt burden calibrated to a job market that no longer exists in the form they were promised.

Corporate strategy across non-tech industries has been reshaped around AI assumptions. Companies in finance, healthcare, manufacturing, logistics, and retail have all made strategic commitments, hiring decisions, and capital allocation choices based on the premise that AI will transform their operations within a specific timeframe. If that transformation takes longer than expected or delivers less value than projected, the opportunity cost of those commitments is significant. Resources that could have been allocated to proven operational improvements were instead directed toward AI initiatives that may not pay off.

Media and information ecosystems have been reshaped around AI. Publications have hired AI beat reporters, launched AI newsletters, and restructured their coverage to prioritize AI stories because those stories drive engagement. When the narrative shifts, the media ecosystem will overcorrect toward skepticism with the same intensity it overcorrected toward enthusiasm, which will make it harder for legitimately valuable AI work to attract attention, funding, and public support.

The cumulative effect of these second-order corrections is a general loss of institutional trust in technology-driven economic transformation. This is perhaps the most costly long-term consequence. After the dot-com crash, there was a multi-year period where "internet company" was a pejorative rather than a premium. After the AI bubble, something similar will happen to "AI company," and the legitimate research and applications that survive the correction will operate under a cloud of skepticism that makes everything harder.

## The global dimension

I have focused primarily on the US because that is where the majority of AI capital expenditure is concentrated, but the bubble has global dimensions that amplify the risk.

China is conducting its own parallel AI investment boom with different structural properties but similar overinvestment dynamics. The US-China competition in AI has created a dynamic where neither country can afford to be seen as pulling back, even if the economic justification for continued escalation is weakening. This geopolitical lock-in means that the global AI investment cycle is harder to moderate than a purely market-driven cycle would be.

European and Asian economies that are positioning themselves as AI hubs, the UK, France, Japan, South Korea, the UAE, and Singapore among them, are making public investment commitments that are calibrated to the current AI boom narrative. If the US-led bubble pops, these commitments become fiscally exposed in countries with less capacity to absorb the losses.

Developing economies that were counting on AI-driven outsourcing demand to fuel growth may face a different problem. If AI tools reduce demand for outsourced services, including call centers, basic software development, and data labeling, the economic development model that has lifted hundreds of millions of people out of poverty over the past three decades faces a structural challenge that has nothing to do with bubble dynamics but everything to do with the technology itself.

## What this means for people who actually work in AI

This is the part that is most personal and most uncomfortable.

I work in AI. I chose this field because I think the technology is genuinely important and because I think the specific problem I work on, interpretability, is load-bearing for the long-term safety and usefulness of these systems. I did not choose it because I thought it was a guaranteed path to financial security.

But a lot of people did. A lot of people pivoted into AI, took AI-focused roles, joined AI startups, or restructured their careers around the AI boom. Many of them are talented and doing real work. And many of them will be affected if investment pulls back significantly.

The pattern from previous technology corrections is clear: when the bubble pops, the correction overcorrects. Companies do not just reduce AI spending to sustainable levels. They cut below sustainable levels because the narrative has shifted from "AI is the future" to "AI was overhyped" and nobody wants to be the last one holding the bag. Useful research gets defunded. Good engineers get laid off. Promising startups lose their runway. The babies get thrown out with the bathwater.

This is wasteful and stupid but it is also predictable. If you are working in AI and building a career around it, I think the responsible thing is to have a clear-eyed view of this dynamic and to make sure your skills and your financial position can survive a period where the industry contracts before it finds its sustainable level.

For me personally, the calculation is relatively simple. Interpretability research will be important regardless of whether the bubble inflates or deflates, because the need to understand these systems does not go away when investment levels change. If anything, a correction that removes the hype layer might make it easier to do serious technical work without the constant pressure to demonstrate immediate commercial returns.

But I am not naive about the fact that research funding follows market sentiment, and that a severe correction in AI valuations would reduce the total amount of money available for the kind of work I want to do. That is a real risk and I think about it regularly.

## What I am not saying

I want to be clear about what this argument does not claim.

I am not saying AI does not work. It does work. Large language models are a genuine technological breakthrough. They are useful for many tasks. They will continue to be useful and will continue to improve.

I am not saying nobody should invest in AI. Some level of AI investment is clearly warranted and will generate positive returns. The question is whether the current level of investment, which is historically unprecedented in its scale and speed, is proportionate to the returns it will generate.

I am not saying the bubble will pop tomorrow or next quarter. Bubbles can persist for longer than skeptics expect because the self-reinforcing dynamics are powerful and the narrative is compelling. The dot-com bubble was obviously inflated by 1998 and did not pop until 2000. Being early is operationally equivalent to being wrong in financial markets.

I am not saying I have a special insight that the market lacks. I might be wrong about the timing, the magnitude, or the specific mechanism of the correction. What I am saying is that the structural analysis points toward a significant gap between AI investment and AI returns, and that historical precedent suggests this gap will close in a way that is economically painful.

## The thing I keep coming back to

When I think about this honestly, the thing I keep returning to is not the financial analysis or the market dynamics. It is the people.

I think about the communities that are building their economies around data centers that might not be needed at the projected scale. I think about the workers who are being displaced by AI tools and told that new jobs will materialize. I think about the engineers who moved their families across the country for AI roles at companies that are burning through capital at unsustainable rates. I think about the students choosing their majors and career paths based on a picture of the AI industry that might look very different in five years.

These are not abstract economic agents. They are people making decisions based on the best information available to them, and much of that information is distorted by the same incentive structures that are inflating the bubble.

I do not have a clean policy prescription. I do not know how to deflate a bubble gently or how to prepare an economy for a transition that has no historical precedent. But I think the minimum useful contribution is to state clearly what I believe to be true, which is that the AI investment cycle is structurally unsustainable at its current scale, and that the adjustment when it comes will be more painful than the optimistic consensus suggests.

If I am wrong, the cost of this analysis is that I look overly cautious in retrospect. If I am right, I hope this is useful to someone who reads it while there is still time to make different decisions.

## A note on writing this

I said at the beginning that this post has been in the works for longer than I want to admit. The reason is not that the analysis was hard to write. The analysis has been stable in my head for over a year. The reason is that writing something publicly bearish about the industry you work in feels genuinely risky. Not in the catastrophic sense, but in the social sense. The AI community is small. People know each other. There is an implicit expectation that if you work in the field, you believe in the field, and that belief includes the financial thesis, not just the technical thesis.

I do believe in the technical thesis. I believe these systems are important and that understanding them is one of the most interesting problems in computer science. But I have never been able to make myself believe the financial thesis, and the longer I waited to say that out loud, the more dishonest the silence felt.

So this is me saying it out loud. The AI bubble is real. The correction will be painful. The recovery will be slower than people expect. And the people who will bear the highest cost are not the ones making the investment decisions.

I hope I am wrong. I do not think I am.
