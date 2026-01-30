///

// DiagramAnimations.js
let pipeAnimationInstance = null;
let wavesAnimationInstance = null;
let wavesOffsetAnimationInstance = null;

export const updateAnimation = (goInstance, currentDiagram) => {
    // console.log("DiagramAnimations: updateAnimation called", { goInstance: !!goInstance, currentDiagram: !!currentDiagram });
    
    if (!goInstance || !currentDiagram) {
        console.warn("DiagramAnimations: updateAnimation called with invalid goInstance or currentDiagram.");
        return;
    }

    // Robust check for Animation and its easing functions using the passed goInstance
    const GoAnimation = goInstance.Animation;
    if (!GoAnimation || 
        typeof GoAnimation.EaseLinear !== 'function' || 
        typeof GoAnimation.EaseInOutQuad !== 'function') {
        console.warn("DiagramAnimations: updateAnimation - goInstance.Animation or its easing functions are not available. Skipping animation setup.");
        return;
    }
    
    // Stop existing animations
    if (pipeAnimationInstance) {
        pipeAnimationInstance.stop();
        pipeAnimationInstance = null;
    }
    
    // Pipe animation for links
    try {
        const newPipeAnimation = new GoAnimation();
        newPipeAnimation.easing = GoAnimation.EaseLinear;
        newPipeAnimation.duration = 500; // 2 seconds for one cycle
        
        let animationElementsAdded = 0;
        
        // Use proper GoJS iterator
        const linksIterator = currentDiagram.links;
        linksIterator.each((link) => {
            const pipe = link.findObject('PIPE');
            if (pipe) {
                // console.log("DiagramAnimations: Found PIPE element, adding to animation");
                newPipeAnimation.add(pipe, 'strokeDashOffset', 20, 0);
                animationElementsAdded++;
            } else {
                // console.log("DiagramAnimations: No PIPE element found in link");
            }
        });
        
        
        if (animationElementsAdded > 0) {
            newPipeAnimation.runCount = Infinity;
            newPipeAnimation.start();
            pipeAnimationInstance = newPipeAnimation;
        } else {
            // console.log("DiagramAnimations: No elements for pipe animation.");
        }
    } catch (e) {
        // console.error("DiagramAnimations: Error setting up pipe animation:", e);
    }

    // Stop existing waves animations
    if (wavesAnimationInstance) {
        wavesAnimationInstance.stop();
        wavesAnimationInstance = null;
    }

    // Waves animation for nodes
    try {
        const newWavesAnimation = new GoAnimation();
        newWavesAnimation.easing = GoAnimation.EaseInOutQuad;
        newWavesAnimation.reversible = true;
        newWavesAnimation.duration = 2000;
        
        let waveElementsAdded = 0;
        
        const nodesIterator = currentDiagram.nodes;
        nodesIterator.each((node) => {
            let wave1 = node.findObject('WAVE1');
            let wave2 = node.findObject('WAVE2');
            if (wave1 && typeof wave1.parameter1 !== 'undefined') {
                newWavesAnimation.add(wave1, 'waves', 0, 1);
                waveElementsAdded++;
            }
            if (wave2 && typeof wave2.parameter1 !== 'undefined') {
                newWavesAnimation.add(wave2, 'waves', 1, 0);
                waveElementsAdded++;
            }
        });
        
        if (waveElementsAdded > 0) {
            newWavesAnimation.runCount = Infinity;
            newWavesAnimation.start();
            wavesAnimationInstance = newWavesAnimation;
            // console.log("DiagramAnimations: Waves animation started successfully");
        } else {
            // console.log("DiagramAnimations: No elements for waves animation.");
        }
    } catch (e) {
        console.error("DiagramAnimations: Error setting up waves animation:", e);
    }

    // Stop existing waves offset animations
    if (wavesOffsetAnimationInstance) {
        wavesOffsetAnimationInstance.stop();
        wavesOffsetAnimationInstance = null;
    }

    // Waves offset animation
    try {
        const newWavesOffsetAnimation = new GoAnimation();
        newWavesOffsetAnimation.easing = GoAnimation.EaseInOutQuad;
        newWavesOffsetAnimation.reversible = true;
        newWavesOffsetAnimation.duration = 5000;
        
        let offsetElementsAdded = 0;
        
        const nodesIterator = currentDiagram.nodes;
        nodesIterator.each((node) => {
            let waveGraduatedPanel = node.findObject('WAVE_GRADUATED_PANEL');
            if (waveGraduatedPanel && typeof waveGraduatedPanel.alignment !== 'undefined') {
                newWavesOffsetAnimation.add(waveGraduatedPanel, 'offset', -30, 0);
                offsetElementsAdded++;
            }
        });
        
        if (offsetElementsAdded > 0) {
            newWavesOffsetAnimation.runCount = Infinity;
            newWavesOffsetAnimation.start();
            wavesOffsetAnimationInstance = newWavesOffsetAnimation;
            console.log("DiagramAnimations: Waves offset animation started successfully");
        } else {
            // console.log("DiagramAnimations: No elements for waves offset animation.");
        }
    } catch (e) {
        // console.error("DiagramAnimations: Error setting up waves offset animation:", e);
    }
};

// Export function to stop all animations (useful for cleanup)
export const stopAllAnimations = () => {
    if (pipeAnimationInstance) {
        pipeAnimationInstance.stop();
        pipeAnimationInstance = null;
    }
    if (wavesAnimationInstance) {
        wavesAnimationInstance.stop();
        wavesAnimationInstance = null;
    }
    if (wavesOffsetAnimationInstance) {
        wavesOffsetAnimationInstance.stop();
        wavesOffsetAnimationInstance = null;
    }
};